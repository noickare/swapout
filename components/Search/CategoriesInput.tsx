import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Input, Tag, Tooltip } from 'antd';
import React from 'react';

interface ICategoriesInput {
  handleTagClose: (removedTag: string) => void;
  handleTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagInputConfirm: () => void;
  handleEditInputConfirm: () => void;
  handleTagEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTagDoubleClick: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, index: number, tag: string) => void;
  tags: string[];
  tagInputVisible: boolean;
  showTagInput: () => void;
  editTagInputIndex: number;
  editTagInputValue: string;
  tagInputRef: React.Ref<InputRef> | undefined;
  editTagInputRef: React.Ref<InputRef> | undefined;
  tagInputValue: string;
}

const CategoriesInput: React.FC<ICategoriesInput> = ({ tags,
  editTagInputIndex,
  editTagInputRef,
  editTagInputValue,
  handleTagInputChange,
  handleEditInputConfirm,
  handleTagClose,
  tagInputVisible,
   tagInputRef,
   tagInputValue,
   handleTagEditInputChange,
   showTagInput,
   handleTagInputConfirm,
   onTagDoubleClick
}) => {
  return (
    <>
      {tags.map((tag, index) => {
        if (editTagInputIndex === index) {
          return (
            <Input
              ref={editTagInputRef}
              key={tag}
              size="small"
              className="tag-input"
              value={editTagInputValue}
              onChange={handleTagEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }

        const isLongTag = tag.length > 20;

        const tagElem = (
          <Tag
            className="edit-tag"
            key={tag}
            closable={true}
            onClose={() => handleTagClose(tag)}
          >
            <span
              onDoubleClick={(e) =>onTagDoubleClick(e, index, tag)}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {tagInputVisible && (
        <Input
          ref={tagInputRef}
          type="text"
          size="small"
          className="tag-input"
          value={tagInputValue}
          onChange={handleTagInputChange}
          onBlur={handleTagInputConfirm}
          onPressEnter={handleTagInputConfirm}
        />
      )}
      {!tagInputVisible && (
        <Tag className="site-tag-plus" onClick={showTagInput}>
          <PlusOutlined /> New Category
        </Tag>
      )}
    </>
  );
};

export default CategoriesInput;