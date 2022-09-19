// const express = require('express')
import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import { Request, Response } from 'express';
import TriggerRedeploy from './redeploy'

const PORT = process.env.PORT || 8090

const app = express()
app.use(express.json({ limit: '5mb' }))
app.use(cors())

app.get('/status', (req: Request, res: Response) => { res.send("Redeploy server working.") })

// Github Webhook for redeploying server & queue for processing redeploys
TriggerRedeploy.initialize({
    app,
    webhookEndpoint: process.env.GITHUB_WEBHOOK_REDEPLOY_ENDPOINT,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    deployScriptPath: process.env.REDEPLOY_SCRIPT_ABSOLUTE_PATH
})


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})