import { Card, Input, Spin } from "antd";
import { FC, useRef, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import configs from "../../shared/configs";

import ClickAwayListener from "../ClickAwayListener";

interface GifPickerProps {
  setIsOpened: (value: boolean) => void;
  onSelect: (gif: any) => void;
  isGifPickerOpen: boolean;
}

const GifPicker: FC<GifPickerProps> = ({ setIsOpened, onSelect, isGifPickerOpen }) => {
  const [searchInputValue, setSearchInputValue] = useState("");

  const timeOutRef = useRef<any>(null);

  const { data, loading, error } = useFetch(`giphy-${searchInputValue}`, () =>
    fetch(
      searchInputValue.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${configs.giphyAPIKey
        }&q=${encodeURIComponent(searchInputValue.trim())}`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${configs.giphyAPIKey}`
    ).then((res) => res.json())
  );

  console.log('gifpicker', isGifPickerOpen)

  const styles = {
    cardBody: {
      maxHeight: '24rem',
      overflow: "auto"
    }
  }

  return (
    // <ClickAwayListener onClickAway={() => setIsOpened(!isGifPickerOpen)}>
    //   {(ref) => (
    <Card
      style={{ height: '24rem', width: '24rem', position: 'absolute', left: '-92px', display: 'flex', flexDirection: 'column', bottom: '100%', alignItems: 'stretch' }}
      bodyStyle={styles.cardBody}
    // ref={ref}
    >
      <div className="relative">
        <Input
          style={{ borderRadius: '25px' }}
          onChange={(e) => {
            if (timeOutRef.current) clearTimeout(timeOutRef.current);
            timeOutRef.current = setTimeout(() => {
              setSearchInputValue(e.target.value);
            }, 500);
          }}
          type="text"
          className="bg-dark-lighten w-full rounded-full py-2 pl-10 pr-4 outline-none"
          placeholder="Search..."
        />
        <i className="bx bx-search absolute top-1/2 left-3 -translate-y-1/2 text-xl"></i>
      </div>

      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spin />
        </div>
      ) : error ? (
        <div className="flex flex-grow flex-col items-center justify-center">
          <p className="text-center">
            Sorry... Giphy has limited the request
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-grow flex-wrap gap-2 overflow-y-auto">
          {(data as any).data.map((item: any) => (
            <img
              key={item.id}
              onClick={() => {
                onSelect(item?.images?.original?.url);
                setIsOpened(!isGifPickerOpen);
              }}
              className="h-[100px] flex-1 cursor-pointer object-cover"
              src={item?.images?.original?.url}
              alt=""
            />
          ))}
        </div>
      )}
    </Card>
    //   )}
    // </ClickAwayListener>
  );
};

export default GifPicker;
