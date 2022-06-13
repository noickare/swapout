import react from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 64 }} spin />;

// Return value should be component
const CenterLoader = () => {
    return (
        <div className="flex justify-center items-center h-screen flex-col">
            <Spin indicator={antIcon} />
            <p className="text-base text-gray-900">Loading...</p>
        </div>
    )
}

export default CenterLoader;