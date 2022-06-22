import React from 'react'
import { useRouter } from 'next/router'
import { Result, Button } from 'antd'
import { GenerateSiteTags } from '../utils/generateSiteTags'

export default function Custom404() {
  const router = useRouter()
  return (
    <>
      <GenerateSiteTags title="Not found!" description="Requested item not found" image="" url={`${process.env.NEXT_PUBLIC_URL}/404` || 'http://clueswap.com/404'} />
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button onClick={() => router.push('/')} type="primary">
            Back Home
          </Button>
        }
      />
    </>
  )
}