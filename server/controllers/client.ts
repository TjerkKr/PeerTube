import * as express from 'express'
import { join } from 'path'
import * as validator from 'validator'
import * as Promise from 'bluebird'

import { database as db } from '../initializers/database'
import {
  CONFIG,
  STATIC_PATHS,
  STATIC_MAX_AGE,
  OPENGRAPH_AND_OEMBED_COMMENT
} from '../initializers'
import { root, readFileBufferPromise, escapeHTML } from '../helpers'
import { VideoInstance } from '../models'

const clientsRouter = express.Router()

const distPath = join(root(), 'client', 'dist')
const embedPath = join(distPath, 'standalone', 'videos', 'embed.html')
const indexPath = join(distPath, 'index.html')

// Special route that add OpenGraph and oEmbed tags
// Do not use a template engine for a so little thing
clientsRouter.use('/videos/watch/:id', generateWatchHtmlPage)

clientsRouter.use('/videos/embed', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.sendFile(embedPath)
})

// Static HTML/CSS/JS client files
clientsRouter.use('/client', express.static(distPath, { maxAge: STATIC_MAX_AGE }))

// 404 for static files not found
clientsRouter.use('/client/*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.sendStatus(404)
})

// ---------------------------------------------------------------------------

export {
  clientsRouter
}

// ---------------------------------------------------------------------------

function addOpenGraphAndOEmbedTags (htmlStringPage: string, video: VideoInstance) {
  const previewUrl = CONFIG.WEBSERVER.URL + STATIC_PATHS.PREVIEWS + video.getPreviewName()
  const videoUrl = CONFIG.WEBSERVER.URL + '/videos/watch/' + video.uuid

  const videoName = escapeHTML(video.name)
  const videoDescription = escapeHTML(video.description)

  const openGraphMetaTags = {
    'og:type': 'video',
    'og:title': videoName,
    'og:image': previewUrl,
    'og:url': videoUrl,
    'og:description': videoDescription,

    'name': videoName,
    'description': videoDescription,
    'image': previewUrl,

    'twitter:card': 'summary_large_image',
    'twitter:site': '@Chocobozzz',
    'twitter:title': videoName,
    'twitter:description': videoDescription,
    'twitter:image': previewUrl
  }

  const oembedLinkTags = [
    {
      type: 'application/json+oembed',
      href: CONFIG.WEBSERVER.URL + '/services/oembed?url=' + encodeURIComponent(videoUrl),
      title: videoName
    }
  ]

  let tagsString = ''
  Object.keys(openGraphMetaTags).forEach(tagName => {
    const tagValue = openGraphMetaTags[tagName]

    tagsString += `<meta property="${tagName}" content="${tagValue}" />`
  })

  for (const oembedLinkTag of oembedLinkTags) {
    tagsString += `<link rel="alternate" type="${oembedLinkTag.type}" href="${oembedLinkTag.href}" title="${oembedLinkTag.title}" />`
  }

  return htmlStringPage.replace(OPENGRAPH_AND_OEMBED_COMMENT, tagsString)
}

function generateWatchHtmlPage (req: express.Request, res: express.Response, next: express.NextFunction) {
  const videoId = '' + req.params.id
  let videoPromise: Promise<VideoInstance>

  // Let Angular application handle errors
  if (validator.isUUID(videoId, 4)) {
    videoPromise = db.Video.loadByUUIDAndPopulateAuthorAndPodAndTags(videoId)
  } else if (validator.isInt(videoId)) {
    videoPromise = db.Video.loadAndPopulateAuthorAndPodAndTags(+videoId)
  } else {
    return res.sendFile(indexPath)
  }

  Promise.all([
    readFileBufferPromise(indexPath),
    videoPromise
  ])
  .then(([ file, video ]) => {
    file = file as Buffer
    video = video as VideoInstance

    const html = file.toString()

    // Let Angular application handle errors
    if (!video) return res.sendFile(indexPath)

    const htmlStringPageWithTags = addOpenGraphAndOEmbedTags(html, video)
    res.set('Content-Type', 'text/html; charset=UTF-8').send(htmlStringPageWithTags)
  })
  .catch(err => next(err))
}
