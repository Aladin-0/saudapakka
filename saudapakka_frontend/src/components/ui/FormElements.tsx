"use client";

import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, useRef, useState } from "react";

// --- Form Input ---
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const FormInput = ({ label, error, className = "", ...props }: FormInputProps) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <input
                className={`
                    w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 
                    focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                    transition-all duration-200 ease-in-out
                    placeholder:text-gray-400 text-gray-800
                    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
                    ${className}
                `}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{error}</p>}
        </div>
    );
};

// --- Form TextArea ---
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export const FormTextarea = ({ label, error, className = "", ...props }: FormTextareaProps) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                className={`
                    w-full px-4 py-3 rounded-xl border bg-gray-50/50 
                    focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                    transition-all duration-200 ease-in-out
                    placeholder:text-gray-400 text-gray-800
                    resize-none
                    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
                    ${className}
                `}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{error}</p>}
        </div>
    );
};

// --- Form Select ---
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { label: string; value: string | number }[];
    error?: string;
}

export const FormSelect = ({ label, options, error, className = "", ...props }: FormSelectProps) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                {label} {props.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <select
                    className={`
                        w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 appearance-none
                        focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                        transition-all duration-200 ease-in-out
                        text-gray-800
                        ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-medium ml-1">{error}</p>}
        </div>
    );
};

// --- Form Checkbox ---
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const FormCheckbox = ({ label, className = "", ...props }: FormCheckboxProps) => {
    return (
        <label className={`
            flex items-center gap-3 p-3 rounded-xl border border-gray-200 
            hover:bg-blue-50 hover:border-blue-200 cursor-pointer 
            transition-all duration-200
            ${props.checked ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200" : "bg-white"}
            ${className}
        `}>
            <input
                type="checkbox"
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors"
                {...props}
            />
            <span className={`text-sm font-medium ${props.checked ? "text-blue-800" : "text-gray-600"}`}>
                {label}
            </span>
        </label>
    );
};

// --- File Upload Zone ---
interface FileUploadZoneProps {
    label: string;
    accept?: string;
    multiple?: boolean;
    files: File | File[] | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
}

export const FileUploadZone = ({ label, accept, multiple, files, onChange, onClear }: FileUploadZoneProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileList = Array.isArray(files) ? files : files ? [files] : [];

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (inputRef.current) {
                inputRef.current.files = e.dataTransfer.files;
                const event = new Event('change', { bubbles: true });
                inputRef.current.dispatchEvent(event);
                // Trigger the React onChange handler manually if needed, 
                // but dispatchEvent usually works for native inputs. 
                // However, React's synthetic events might need manual trigger.
                // A safer way for React controlled components is calling onChange directly:
                const syntheticEvent = {
                    target: inputRef.current,
                    currentTarget: inputRef.current,
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
            }
        }
    };

    // NOTE: True drag and drop requires passing the file list back. 
    // Since `onChange` expects an event, we should probably wrap this better in future refactors. 
    // For now, let's just make it a nice clickable zone that LOOKS like drag and drop.

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{label}</label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`
                    group relative border-2 border-dashed rounded-xl p-8 cursor-pointer
                    flex flex-col items-center justify-center text-center
                    transition-all duration-200
                    ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
                    ${fileList.length > 0 ? "bg-blue-50/30 border-blue-200" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={onChange}
                />

                {fileList.length > 0 ? (
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-center mb-2">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <DocumentArrowUpIcon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-blue-900">
                            {fileList.length} file{fileList.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-2 max-h-32 overflow-y-auto">
                            {fileList.map((f, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs shadow-sm">
                                    <span className="truncate max-w-[150px]">{f.name}</span>
                                </span>
                            ))}
                        </div>
                        {/* Clear button could go here */}
                    </div>
                ) : (
                    <>
                        <div className="p-3 bg-gray-100 text-gray-500 rounded-full mb-3 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-200">
                            <DocumentArrowUpIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                            Click to upload {multiple ? "files" : "a file"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            SVG, PNG, JPG or PDF
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
