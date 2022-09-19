import RedeployQueue from 'better-queue'
import { spawn } from 'child_process'
import { sendRedeployFailedErrorNotification } from './sns-service'
import { Request, Response } from 'express'
import crypto from 'crypto'

type RedeployParams = {
  app: any,
  webhookEndpoint: string,
  webhookSecret: string,
  deployScriptPath: string
}

const redeployQueue = new RedeployQueue((input : any, cb : any) => {
  const time = new Date()
  const { scriptPath, hasEmailNotification } = input

  console.log('*** Starting redeploy request from the queue...')
  console.log(' --- Script path is: ', scriptPath)
  const proc = spawn(scriptPath)

  proc.stdout.on('data', (data : any) => {
    console.log('--- ' + data.toString())
  })

  proc.stderr.on('data', (data : any) => {
    console.log('--- ' + data.toString())
  })

  proc.on('exit', (code : any) => {
    const now = new Date()
    const duration = (now.getTime() - time.getTime()) / 1000
    if (code === 0) {
      console.log(`\n*** Site redeploy complete! Exited with code ${code}`)
      console.log(`*** Redeploy took: ${Math.floor(duration / 60)} minutes, ${duration % 60} seconds.\n\n`)
    }
    else {
      console.log(`\n\n\n *** SITE REDEPLOY FAILED ***\n`)
      if (hasEmailNotification)
        sendRedeployFailedErrorNotification()
    }
    cb(null, 0)
  })
})

const initialize = (params: RedeployParams) => {
  const { app, webhookEndpoint, webhookSecret, deployScriptPath } = params
  console.log('Init: ', webhookEndpoint, webhookSecret, deployScriptPath)

  app.post(webhookEndpoint, (request: any, response: Response) => {

    const data = request.body
    const rawData = request.rawBody

    let sig = "sha1=" + crypto.createHmac('sha1', webhookSecret).update(rawData).digest('hex');
    console.log('Sig is: ', sig)
    console.log('Received: ', request.headers['x-hub-signature'])

    if (sig !== request.headers['x-hub-signature']) {
      response.status(400)
      return
    }

    console.log(`*** Received a push event for ${data.repository.name} to ${data.ref}`)
    if (data.ref === 'refs/heads/main') {
      console.log('*** The push is on branch "main", adding a site redeploy job to the queue!')
      const now = new Date()
      const hasEmailNotification = (process.env.HAS_AWS_SNS_EMAIL_NOTIFICATION === 'true')
      redeployQueue.push({ redeploy: true, time: now, scriptPath: deployScriptPath, hasEmailNotification })
    }
    response.send({ success: true })
  })
}

export default { initialize }