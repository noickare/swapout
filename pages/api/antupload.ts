import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).end('success')
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
}