import React from 'react'

const Field = ({ label, children, htmlFor, error }) => {

    return (
        <div className="flex flex-col items-start justify-start mt-2 p-0 w-full mr-2">
            {label && <label className="block text-sm font-medium text-gray-700" htmlFor={htmlFor} >{label}</label>}
            {children}
            {error && <p className='mt-1 text-sm text-red-500' >{error?.message}</p>}
        </div>
    );
};

export default Field;