/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import { Button, DatePicker, Form, Input, Modal, Select, Typography, Upload, Spin } from 'antd';
import { RcFile, UploadFile, UploadProps } from 'antd/lib/upload/interface';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../context/authContext';
import { useRouter } from 'next/router';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { YearPicker } = DatePicker;

export default function CreateSwap() {
    const [form] = Form.useForm();
    const [previewImageVisible, setPreviewImageVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [imageList, setImageList] = useState<UploadFile[]>([])
    const { authUser, authLoading } = useAuth();
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(true);



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

    const handleImageChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setImageList(newFileList);


    const onFinish = (values: any) => {
        console.log(form.getFieldValue('name'))
        console.log(values);
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
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
                    <Select
                        placeholder="Select Item Condition"
                        allowClear
                    >
                        <Option value="used">Used</Option>
                        <Option value="new">New</Option>
                        <Option value="refurbished">Refurbished</Option>
                    </Select>
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
                    <Button type="primary" htmlType="submit" size="large">
                        Create
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
