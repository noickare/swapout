import React from 'react'
import { useRouter } from 'next/router'
import { Result, Button } from 'antd'

export default function Custom500() {
  const router = useRouter()
  return (
    <>
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