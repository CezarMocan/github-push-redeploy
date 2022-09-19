import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";

const client = new SNSClient({ region: process.env.AWS_REGION });

export const sendRedeployFailedErrorNotification = async () => {
  await sendGenericErrorNotification(`truename.me API server deploy failed, please check the logs.`)
}

export const sendGenericErrorNotification = async (message) => {
  const input : PublishCommandInput = {
    TopicArn: process.env.AWS_ALERT_ARN,
    Message: `Caught generic exception in True Name server.\n ${message}`
  }

  const command = new PublishCommand(input)
  await client.send(command)
}