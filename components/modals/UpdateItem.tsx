import { PlusOutlined } from '@ant-design/icons';
import { Typography, Input, Select, DatePicker, Form, Upload, Modal, Button, InputRef, message } from 'antd';
import form from 'antd/lib/form';
import { RcFile, UploadFile, UploadProps } from 'antd/lib/upload/interface';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { useAuth } from '../../context/authContext';
import { IItem } from '../../models/item';
import { firebaseStorage } from '../../services/init_firebase';
import CategoriesInput from '../Search/CategoriesInput';
import { IAdress } from './UpdateUserProfile';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { YearPicker } = DatePicker;

type Props = {
    itemData?: IItem;
    onUpdateFinish: (values: any, address?: IAdress, imagesUrl?: string[], categories?: string[]) => Promise<void>;
    isSubmitting: boolean;
}

export default function UpdateItem({ itemData, onUpdateFinish, isSubmitting }: Props) {
    const [form] = Form.useForm();
    const [previewImageVisible, setPreviewImageVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [imageList, setImageList] = useState<UploadFile[]>([])
    const { authUser, authLoading } = useAuth();
    const [address, setAddress] = useState<IAdress | undefined>();
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInputVisible, setTagInputVisible] = useState(false);
    const [tagInputValue, setTagInputValue] = useState('');
    const [editTagInputIndex, setTagEditInputIndex] = useState(-1);
    const [editTagInputValue, setTagEditInputValue] = useState('');
    const tagInputRef = useRef<InputRef>(null);
    const editTagInputRef = useRef<InputRef>(null);

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    const handleImagePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewImageVisible(true);
    };

    const beforeUpload = (file: RcFile, fileList: RcFile[]) => {
        if (!["image/jpeg", "image/png"].includes(file.type)) {
            const updatedList = fileList.filter((fl) => fl.uid !== file.uid);
            setImageList(updatedList);
            message.error(`${file.name} is not a valid image type`, 2);
            return null;
        }
        return false;
    };


    const handleImageChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
        const newFileArray = newFileList.filter(x => !imageList.includes(x));
        const newFile = newFileArray[0] || undefined;
        if (newFile) {
            const fileName = `items/images/${Date.now()}-${newFile.name}`;
            const fileRef = ref(firebaseStorage, fileName);
            try {
                if (newFile.originFileObj) {
                    const designFile = await uploadBytes(fileRef, newFile.originFileObj);
                    const downloadUrl = await getDownloadURL(designFile.ref)
                    setImageUrls([...imageUrls, downloadUrl]);
                }
            } catch (e) {
                console.log(e);
                message.error('Error uploading file! Please try again')
            }
            setImageList(newFileList);
        } else {
            const uniqueUrlArray = newFileList.filter((x) => {
                return imageUrls.includes(x.url as string)
            })
            const newUrlArray = uniqueUrlArray.map((fl) => fl.url as string)
            setImageList(newFileList);
            setImageUrls(newUrlArray);
        }
    }

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    useEffect(() => {
        if (tagInputVisible) {
            tagInputRef.current?.focus();
        }
    }, [tagInputVisible]);

    useEffect(() => {
        editTagInputRef.current?.focus();
    }, [editTagInputRef]);


    const handleTagClose = (removedTag: string) => {
        const newTags = tags.filter(tag => tag !== removedTag);
        setTags(newTags);
    };

    const showTagInput = () => {
        setTagInputVisible(true);
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInputValue(e.target.value);
    };

    const handleTagInputConfirm = () => {
        if (tagInputValue && tags.indexOf(tagInputValue) === -1) {
            setTags([...tags, tagInputValue]);
        }
        setTagInputVisible(false);
        setTagInputValue('');
    };

    const handleTagEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagEditInputValue(e.target.value);
    };

    const handleTagEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editTagInputIndex] = editTagInputValue;
        setTags(newTags);
        setTagEditInputIndex(-1);
        setTagInputValue('');
    };


    const onTagDoubleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, index: number, tag: string) => {
        if (index !== 0) {
            setTagEditInputIndex(index);
            setTagEditInputValue(tag);
            e.preventDefault();
        }
    }

    useEffect(() => {
        setAddress(itemData?.location)
        if (typeof itemData?.category == "string") {
            setTags([itemData?.category] || [])
        } else {
            setTags(itemData?.category || [])
        }
        if (itemData?.images) {
            const itemImg = itemData.images.map((img, i) => {
                const uid = i - (i * 2);
                const upFile: UploadFile<any> = {
                    uid: uid.toString(),
                    name: img,
                    status: 'done',
                    url: img
                }
                return upFile
            })
            setImageList(itemImg);

        }
        setImageUrls(itemData?.images || [])
    }, [itemData?.category, itemData?.images, itemData?.location])


    async function onFinish(values: any) {
        // onUpdateFinish()
        onUpdateFinish(values, address, imageUrls, tags);
    }

    return (
        <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
            <Title className="text-center" level={3}>Update Item</Title>
            <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                style={{ margin: '0 auto' }}
                className="w-full" form={form}
                name="control-hooks"
                onFinish={onFinish}
            >
                <Form.Item initialValue={itemData?.name} name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="location" label="Location" rules={[{ required: false }]}>
                    <PlacesAutocomplete
                        value={address?.address}
                        onChange={(add) => {
                            setAddress({ address: add, lat: undefined, lng: undefined });
                        }
                        }
                        onSelect={(addSelected) => {
                            form.setFieldsValue({ location: addSelected })
                            geocodeByAddress(addSelected)
                                .then((results) => getLatLng(results[0]))
                                .then(({ lat, lng }) => {
                                    setAddress({ address: addSelected, lat: lat, lng: lng });
                                })
                        }}
                    >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                            <div>
                                <Input
                                    {...getInputProps({
                                        placeholder: 'Search Location ...',
                                    })}
                                    value={address?.address}
                                />
                                <div className="autocomplete-dropdown-container">
                                    {loading && <div>Loading...</div>}
                                    {suggestions.map((suggestion) => {
                                        const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item'
                                        // inline style for demonstration purpose
                                        const style = suggestion.active
                                            ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                            : { backgroundColor: '#ffffff', cursor: 'pointer' }
                                        return (
                                            // eslint-disable-next-line react/jsx-key
                                            <div
                                                {...getSuggestionItemProps(suggestion, {
                                                    className,
                                                    style,
                                                })}
                                            >
                                                <span>{suggestion.description}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </PlacesAutocomplete>
                </Form.Item>
                <Form.Item initialValue={itemData?.description} name="description" label="Description" rules={[{ required: true }]}>
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item initialValue={itemData?.condition} name="condition" label="Condition" rules={[{ required: true }]}>
                    <Select
                        placeholder="Select Item Condition"
                        allowClear
                    >
                        <Option value="Used">Used</Option>
                        <Option value="New">New</Option>
                        <Option value="Refurbished">Refurbished</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="category" label="Category" rules={[{ required: false }]}>
                    <CategoriesInput
                        handleTagClose={handleTagClose}
                        handleTagInputChange={handleTagInputChange}
                        handleTagInputConfirm={handleTagInputConfirm}
                        handleEditInputConfirm={handleTagEditInputConfirm}
                        tags={tags}
                        tagInputVisible={tagInputVisible}
                        showTagInput={showTagInput}
                        editTagInputIndex={editTagInputIndex}
                        editTagInputValue={editTagInputValue}
                        editTagInputRef={editTagInputRef}
                        tagInputRef={tagInputRef}
                        tagInputValue={tagInputValue}
                        handleTagEditInputChange={handleTagEditInputChange}
                        onTagDoubleClick={onTagDoubleClick}
                    />
                </Form.Item>
                <Form.Item initialValue={itemData?.yearManufactured && moment(new Date(itemData?.yearManufactured, 11, 17, 0, 0, 0, 0))} name="yearManufactured" label="Year Manufactured" rules={[{ required: true }]}>
                    <YearPicker />
                </Form.Item>
                <Form.Item initialValue={itemData?.yearBought && moment(new Date(itemData?.yearBought, 11, 17, 0, 0, 0, 0))} name="yearBought" label="Year Bought" rules={[{ required: true }]}>
                    <YearPicker />
                </Form.Item>
                <Form.Item name="images" label="Images">
                    <Upload
                        action="/api/antupload"
                        listType="picture-card"
                        fileList={imageList}
                        onPreview={handleImagePreview}
                        onChange={handleImageChange}
                        //  @ts-ignore
                        beforeUpload={(file: RcFile, FileList: RcFile[]) => beforeUpload(file, FileList)}
                        accept="image/*"
                    >
                        {imageList.length >= 15 ? null : uploadButton}
                    </Upload>
                    <Modal visible={previewImageVisible} footer={null} onCancel={() => setPreviewImageVisible(false)}>
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </Form.Item>
                <Form.Item initialValue={itemData?.itemToExchangeWith} name="itemTOExchange" label="Item to exchange with" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button loading={isSubmitting} disabled={isSubmitting} type="primary" htmlType="submit" size="large">
                        Update
                    </Button>
                </Form.Item>
            </Form>
        </div >
    )
}