import * as request from 'supertest'

import { ServerInfo } from './servers'

type Client = { id: string, secret: string }
type User = { username: string, password: string }
type Server = { url: string, client: Client, user: User }

function login (url: string, client: Client, user: User, expectedStatus = 200) {
  const path = '/api/v1/users/token'

  const body = {
    client_id: client.id,
    client_secret: client.secret,
    username: user.username,
    password: user.password,
    response_type: 'code',
    grant_type: 'password',
    scope: 'upload'
  }

  return request(url)
          .post(path)
          .type('form')
          .send(body)
          .expect(expectedStatus)
}

async function loginAndGetAccessToken (server: Server) {
  const res = await login(server.url, server.client, server.user, 200)

  return res.body.access_token as string
}

async function getUserAccessToken (server, user) {
  const res = await login(server.url, server.client, user, 200)

  return res.body.access_token as string
}

function setAccessTokensToServers (servers: ServerInfo[]) {
  const tasks: Promise<any>[] = []

  for (const server of servers) {
    const p = loginAndGetAccessToken(server).then(t => server.accessToken = t)
    tasks.push(p)
  }

  return Promise.all(tasks)
}

// ---------------------------------------------------------------------------

export {
  login,
  loginAndGetAccessToken,
  getUserAccessToken,
  setAccessTokensToServers
}
