/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import { Button, DatePicker, Form, Input, Modal, Select, Typography, Upload, Spin, message, AutoComplete } from 'antd';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { RcFile, UploadFile, UploadProps } from 'antd/lib/upload/interface';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../context/authContext';
import { useRouter } from 'next/router';
import { geohashForLocation } from 'geofire-common';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from '../services/init_firebase';
import { IItem } from '../models/item';
import { createItem } from '../services/firestore/item';
import { serverTimestamp } from 'firebase/firestore';
import { openNotificationWithIcon } from '../components/notification/Notification';


const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { YearPicker } = DatePicker;


const categories = [
    { value: 'Phones' },
    { value: 'Electronics' },
    { value: 'Cars' },
];

export default function CreateSwap() {
    const [form] = Form.useForm();
    const [previewImageVisible, setPreviewImageVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [imageList, setImageList] = useState<UploadFile[]>([])
    const { authUser, authLoading } = useAuth();
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(true);
    const [address, setAddress] = useState<{ address: string | undefined, lat: number | undefined, lng: number | undefined }>();
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);



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
        const newFile = newFileArray[0];
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
    }


    const onFinish = async (values: any) => {
        if (!authUser) {
            router.push('/login')
        } else {
            setIsSubmitting(true);
            try {
                const toSaveItem: IItem = {
                    uid: uuidv4(),
                    name: values.name,
                    location: {
                        lat: address?.lat as number,
                        lng: address?.lng as number,
                        address: address?.address as string,
                    },
                    description: values.description,
                    condition: values.condition,
                    yearManufactured: values.yearManufactured.format('YYYY'),
                    yearBought: values.yearBought.format('YYYY'),
                    itemToExchangeWith: values.itemTOExchange,
                    images: imageUrls,
                    ownerId: authUser.uid,
                    createdAt: serverTimestamp(),
                    category: values.category
                }
                const createdItem = await createItem(toSaveItem);
                setIsSubmitting(false);
                router.push(`/item/${createdItem.uid}`)
            } catch (error) {
                console.log(error);
                setIsSubmitting(false);
                openNotificationWithIcon('error', 'Creation Failed', 'An Error ocurred during submission please try again!')
            }
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    React.useEffect(() => {
        if (!authUser && !authLoading) {
            router.push('/login');
            setPageLoading(false);
        } else {
            setPageLoading(false);
            router.push('/create-swap');
        }
    }, []);

    if (pageLoading) return (
        <>
            <Spin size="large" />
        </>
    )

    return (
        <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
            <Title className="text-center" level={3}>Add Item to Swap</Title>
            <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                style={{ margin: '0 auto' }}
                className="w-1/2" form={form}
                name="control-hooks"
                onFinish={onFinish}
            >
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="location" label="Location" rules={[{ required: true }]}>
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
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
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
                    <AutoComplete
                        options={categories}
                        placeholder="Category"
                        filterOption={(inputValue, option) =>
                            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                    />
                </Form.Item>
                <Form.Item name="yearManufactured" label="Year Manufactured" rules={[{ required: true }]}>
                    <YearPicker />
                </Form.Item>
                <Form.Item name="yearBought" label="Year Bought" rules={[{ required: true }]}>
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
                <Form.Item name="itemTOExchange" label="Item to exchange with" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button loading={isSubmitting} disabled={isSubmitting} type="primary" htmlType="submit" size="large">
                        Create
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}