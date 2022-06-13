import React from 'react'
import { useRouter } from 'next/router'
import { Result, Button } from 'antd'

export default function Custom404() {
  const router = useRouter()
  return (
    <>
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