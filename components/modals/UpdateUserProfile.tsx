import { MailOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputRef, message, Modal, Select, Spin, Typography, Upload, UploadProps } from 'antd';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import { serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { useAuth } from '../../context/authContext';
import { IUser } from '../../models/user';
import { firebaseStorage } from '../../services/init_firebase';
import { GenerateSiteTags } from '../../utils/generateSiteTags';
import { openNotificationWithIcon } from '../notification/Notification';
import CategoriesInput from '../Search/CategoriesInput';
import { firestore } from '../../services/init_firebase';
import { ILocation } from '../../models/location';



const { Title } = Typography;
const { TextArea } = Input;

export interface IAdress { address: string | undefined; lat: number | undefined; lng: number | undefined; }

type Props = {
    userData?: IUser;
    onFinish: (values: any, address?: IAdress, avatar?: string) => Promise<void>;
    isSubmitting: boolean
    add?: IAdress,
}

export default function UpdateUserProfile({ userData, onFinish, isSubmitting, add }: Props) {
    const [form] = Form.useForm();
    const [previewImageVisible, setPreviewImageVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [imageList, setImageList] = useState<UploadFile[]>(userData?.avatar ? [{
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: userData?.avatar
    }] : [])
    const { authUser, authLoading } = useAuth();
    const router = useRouter();
    const [address, setAddress] = useState<IAdress | undefined>(add);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

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
            const fileName = `users/images/${Date.now()}-${newFile.name}`;
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
            setImageList([])
        }
    }


    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    useEffect(() => {
        setAddress(userData?.location)
    }, [userData?.location])

    return (
        <>
            <div className="flex flex-col content-center justify-center h-full mt-12 w-full">
                <Title className="text-center" level={3}>Edit {userData?.name || ""} Profile</Title>
                <Form
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 14 }}
                    style={{ margin: '0 auto' }}
                    form={form}
                    name="control-hooks"
                    onFinish={(values) => {
                        onFinish(values, address, imageUrls[0])
                    }}
                >
                    <Form.Item initialValue={userData?.name} name="name" label="Name" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item initialValue={userData?.username} name="username" label="Username" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        initialValue={userData?.email}
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Not a valid email!',
                                type: 'email'
                            },
                        ]}
                    >
                        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
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
                    <Form.Item initialValue={userData?.bio} name="bio" label="Bio" rules={[{ required: false }]}>
                        <TextArea rows={4} />
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
                            {imageList.length >= 1 ? null : uploadButton}
                        </Upload>
                        <Modal visible={previewImageVisible} footer={null} onCancel={() => setPreviewImageVisible(false)}>
                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                        </Modal>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button loading={isSubmitting} disabled={isSubmitting} type="primary" htmlType="submit" size="large">
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    )
}