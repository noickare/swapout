import { Image } from 'antd'
import React from 'react'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

interface CaraouselProps {
    images: string[]
}

const responsive = {
    superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: 1
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
    }
};

export default function Caraousel(props: CaraouselProps) {
    function renderImages() {
        return props.images.map((img, i) => {
            return (
            <Image
                width="100%"
                style={{objectFit: 'cover'}}
                key={i}
                src={img}
                alt={img}
                height={500}
                preview={false}
            />
            )
        })
    }
    return (
        // <div className="h-1/2">
        <Carousel responsive={responsive}>
            {renderImages()}
        </Carousel>
        // </div>
    )
}
