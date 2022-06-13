/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import React from "react";
import Script from "next/script";

const source = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAGvZcCyI8iQgz9NwFgPJ0bKQAiwwrO13s&libraries=places"

const GooglePlacesScript = () => {
    return (
        <Script type="text/javascript" src={source} strategy="beforeInteractive" />
    );
};

export default GooglePlacesScript;