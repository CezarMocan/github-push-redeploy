import createHandler from 'github-webhook-handler'
import RedeployQueue from 'better-queue'
import { spawn } from 'child_process'
import { sendRedeployFailedErrorNotification } from './sns-service'
import { Request, Response } from 'express'

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
  const githubPushHandler = createHandler({ path: webhookEndpoint, secret: webhookSecret })

  app.post(webhookEndpoint, githubPushHandler, (request: Request, response: Response) => {
    response.send({ success: true })
  })

  githubPushHandler.on('push', (event: any) => {
    console.log(`*** Received a push event for ${event.payload.repository.name} to ${event.payload.ref}`)
      if (event.payload.ref === 'refs/heads/main') {
        console.log('*** The push is on branch "main", adding a site redeploy job to the queue!')
        const now = new Date()
        const hasEmailNotification = (process.env.HAS_AWS_SNS_EMAIL_NOTIFICATION === 'true')
        redeployQueue.push({ redeploy: true, time: now, scriptPath: deployScriptPath, hasEmailNotification })
      }
    })
}

export default { initialize }