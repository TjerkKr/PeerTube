import { ServerService } from '../../../core'
import { FormReactive } from '../../../shared'
import { VideoResolution } from '../../../../../../shared/models/videos/video-resolution.enum'

export abstract class UserEdit extends FormReactive {
  videoQuotaOptions = [
    { value: -1, label: 'Unlimited' },
    { value: 0, label: '0'},
    { value: 100 * 1024 * 1024, label: '100MB' },
    { value: 500 * 1024 * 1024, label: '500MB' },
    { value: 1024 * 1024 * 1024, label: '1GB' },
    { value: 5 * 1024 * 1024 * 1024, label: '5GB' },
    { value: 20 * 1024 * 1024 * 1024, label: '20GB' },
    { value: 50 * 1024 * 1024 * 1024, label: '50GB' }
  ]

  protected abstract serverService: ServerService
  abstract isCreation (): boolean
  abstract getFormButtonTitle (): string

  isTranscodingInformationDisplayed () {
    const formVideoQuota = parseInt(this.form.value['videoQuota'], 10)

    return this.serverService.getConfig().transcoding.enabledResolutions.length !== 0 &&
           formVideoQuota > 0
  }

  computeQuotaWithTranscoding () {
    const resolutions = this.serverService.getConfig().transcoding.enabledResolutions
    const higherResolution = VideoResolution.H_1080P
    let multiplier = 0

    for (const resolution of resolutions) {
      multiplier += resolution / higherResolution
    }

    return multiplier * parseInt(this.form.value['videoQuota'], 10)
  }
}
