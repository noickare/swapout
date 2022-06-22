import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react'
import CenterLoader from '../components/loader/CenterLoader';
import { openNotificationWithIcon } from '../components/notification/Notification';
import { IItem } from '../models/item';
import { getItems } from '../services/firestore/item';

type Props = {}

const EXTERNAL_DATA_URL = 'https://clueswap.vercel.app';

export default function Sitemap({ }: Props) {
}

function generateSiteMap(items: IItem[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://clueswap.vercel.app</loc>
     </url>
     <url>
       <loc>https://clueswap.com/register</loc>
     </url>
     ${items
            .map(({ uid }) => {
                return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/item/${uid}/details`}</loc>
       </url>
     `;
            })
            .join('')}
   </urlset>
 `;
}


export async function getServerSideProps({ res }: any) {
    const paginatedItems = await getItems({ itemsLimit: 50 });
    const unique = paginatedItems.itemsArray.filter((v, i, a) => a.indexOf(v) === i);

    const sitemap = generateSiteMap(unique);

    res.setHeader('Content-Type', 'text/xml');
    // we send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
}