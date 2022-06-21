import React from 'react'
import { useRouter } from 'next/router'
import { Result, Button } from 'antd'
import { GenerateSiteTags } from '../utils/generateSiteTags'

export default function Custom404() {
  const router = useRouter()
  return (
    <>
      <GenerateSiteTags title="FOrbidden!" description="You are unauthorized to view this page" image="" url={`${process.env.NEXT_PUBLIC_URL}/403` || 'http://swapout.vercel.app/403'} />
      <Result
        status="403"
        title="Unauthorized!"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button onClick={() => router.push('/')} type="primary">
            Back Home
          </Button>
        }
      />
    </>
  )
}