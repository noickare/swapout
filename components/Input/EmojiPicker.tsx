import { FC } from "react";
import { Picker } from "emoji-mart";
import configs from "../../shared/configs";

interface EmojiPickerProps {
  onSelect: (emoji: any) => void;
}

const EmojiPicker: FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <Picker
      set="facebook"
      enableFrequentEmojiSort
      onSelect={onSelect}
      showPreview={false}
      showSkinTones={false}
      emojiTooltip
      defaultSkin={1}
      color={configs.primaryColor}
    />
  );
};

export default EmojiPicker;
