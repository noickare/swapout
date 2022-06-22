import React from 'react'
import { truncateString } from './helpers'

type Props = {
    title: string
    description: string
    image: string
    url: string
}

export function GenerateSiteTags({ title, description, image, url }: Props) {
    return (
        <>
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <title>{truncateString(title, 63)}</title>
            <meta name="description" content={truncateString(description, 147)} />
            <meta name="robots" content="index, follow" />
            <meta name="image" content={image} />
            <meta itemProp="name" content={truncateString(title, 63)} />
            <meta itemProp="description" content={truncateString(description, 150)} />
            <meta itemProp="image" content={image} />
            <meta name="twitter:card" content={truncateString(description,150)} />
            <meta name="twitter:title" content={truncateString(title, 63)} />
            <meta name="twitter:description" content={truncateString(description, 150)} />
            <meta name="og:title" content={truncateString(title, 63)} />
            <meta name="og:description" content={truncateString(description, 150)}/>
            <meta name="og:image" content={image} />
            <meta name="og:url" content={url} />
            <meta name="og:site_name" content="clueswap" />
            <meta name="og:locale" content="en_Us" />
            <meta name="og:type" content="product" />
        </>
    )
}