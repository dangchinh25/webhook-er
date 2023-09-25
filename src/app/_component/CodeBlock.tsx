'use client';

import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { IoIosCopy, IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const CodeBlock = ({ code, language }: any) => {
  const [copied, setCopied] = useState(false);
  const notify = () => {
    toast(<ToastDisplay />);
    copy();
  };

  function ToastDisplay() {
    return (
      <div className="m-2">
        <p className="text-md">Copied to clipboard !</p>
      </div>
    );
  }
  const copy = () => {
    console.log('Copied!');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  return (
    <div className="relative rounded-md">
      <button className="absolute flex flex-row top-0 right-0 p-2">
        <span className="m-1 pb-1 basis-3/4 text-xs">{language}</span>
        <CopyToClipboard text={code} onCopy={(copied) => notify()}>
          {copied ? (
            <IoIosCheckmarkCircleOutline className="text-lg m-1 text-green-500 basis-1/4" />
          ) : (
            <IoIosCopy className="text-lg m-1 basis-1/4 hover:text-white" />
          )}
        </CopyToClipboard>
      </button>
      <SyntaxHighlighter
        className="rounded-md"
        language={language}
        style={vs2015}
        wrapLines={true}
        wrapLongLines={true}
        showLineNumbers={false}
        showInlineLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        closeButton={false}
        limit={1}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />
    </div>
  );
};
export default CodeBlock;
