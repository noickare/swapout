import React from 'react'
import { useRouter } from 'next/router'
import { Result, Button } from 'antd'
import { GenerateSiteTags } from '../utils/generateSiteTags'

export default function Custom500() {
  const router = useRouter()
  return (
    <>
      <GenerateSiteTags title="Error!" description="Page load error" image="" url={`${process.env.NEXT_PUBLIC_URL}/500` || 'http://clueswap.com/500'} />
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong."
        extra={
          <Button onClick={() => router.push('/')} type="primary">
            Back Home
          </Button>
        }
      />
    </>
  )
}