import React from 'react'
import { useRouter } from 'next/router'
import { Result, Button } from 'antd'

export default function Custom404() {
  const router = useRouter()
  return (
    <>
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