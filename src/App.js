import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import temp from "./images/soundcloud.png";
import * as Yup from "yup";
import { SlClose } from "react-icons/sl";
import { ImSpinner5 } from "react-icons/im";
// import { ImSpinner2 } from "react-icons/im";
import { Buffer } from "buffer";

function App() {
  const [image, setImage] = useState();
  const [imageTitle, setImageTitle] = useState();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ error: false, text: "Downloading" });
  const urlRegex = /^https?:\/\/(?:www\.)?soundcloud\.com\//;

  function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
  }
  const decodeBase64 = (data) => {
    return Buffer.from(data, "base64").toString("ascii");
  };
  const formik = useFormik({
    initialValues: {
      link: "",
    },
    validationSchema: Yup.object({
      link: Yup.string()
        .matches(urlRegex, () => {
          setError({ error: true, text: "Enter a valid url" });
          return "Enter a valid url";
        })
        .required(() => {
          setError({ error: true, text: "Link required" });
          return "Link required";
        }),
    }),
    onSubmit: (values) => {
      setIsLoading(true);
      axios
        .post("http://localhost:5000/process_data", { link: values.link })
        .then(async (response) => {
          console.log(response.data);
          setImageTitle(response.data.title);
          if (response.data.src) {
            console.log(typeof base64ToUint8Array(response.data.image_blob));
            const file = new File(
              [base64ToUint8Array(response.data.image_blob)],
              response.data.title,
              {
                type: "image/jpeg",
              }
            );
            const reader = new FileReader();
            reader.onloadend = () => {
              setImage(reader.result);
            };
            reader.readAsDataURL(file);

            const objectUrl = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.setAttribute("href", objectUrl);
            link.setAttribute("download", response.data.title);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setError({ error: false, text: "Downloading" });
            setIsPopoverOpen(true);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          setImage();
          setImageTitle();
          setIsPopoverOpen(true);
          setIsLoading(false);
          setError({ error: true, text: error.response.data.error });
          console.error(error);
        });
    },
  });
  useEffect(() => {
    if (isPopoverOpen)
      setTimeout(() => {
        setIsPopoverOpen(false);
      }, 5000);
  });
  return (
    <main className="mb-8 selection:text-red-400 selection:bg-gray-900 bg-cred">
      <div className="flex flex-col items-center pt-4 background">
        <header className="text-center ">
          <h1 className="my-8 text-5xl">Art Aesthetics</h1>
          <p className="my-8 text-lg">
            Download Soundcloud Artworks in original high quality
          </p>
        </header>
        <div
          className={`mt-16 top-0 px-8 py-2 text-sm transition-all duration-500 border rounded-md  border-rose-400 opacity-0 ${
            isPopoverOpen || formik.errors.link ? "opacity-100" : "opacity-0"
          } ${
            error.error || formik.errors.link
              ? "text-cred bg-rose-300"
              : "text-rose-300 bg-gray-300/20"
          }`}
        >
          {error.text}
        </div>
        <form
          onSubmit={formik.handleSubmit}
          className="relative flex w-11/12 p-1 mt-8 text-sm bg-white rounded-lg sm:w-8/12 md:w-6/12 lg:w-4/12"
        >
          <input
            value={formik.values.link}
            onChange={formik.handleChange("link")}
            onBlur={formik.handleBlur("link")}
            className="w-full px-1 mx-2 focus:outline-cred focus:ring-0 text-cred"
            placeholder="https://soundcloud.com/1812922/afraid-of-everything"
          />
          <button
            disabled={isLoading}
            className={`w-1/4 my-0.5 inset-y-0 px-2 py-2.5 bg-cred right-1 rounded-xl hover:bg-red-900 ${
              isLoading && "cursor-not-allowed"
            }`}
            type="submit"
          >
            {isLoading ? (
              <ImSpinner5 className="mx-auto animate-spin" size={20} />
            ) : (
              "Download"
            )}
          </button>
        </form>
      </div>
      {(image || (error.error && !formik.errors.link)) && (
        <div className="flex flex-col w-10/12 gap-6 p-6 mx-auto mt-10 rounded-lg shadow-xl sm:p-10 sm:w-8/12 md:w-8/12 lg:w-6/12 xl:w-4/12">
          <div
            className={`mx-8 font-semibold flex justify-center text-gray-300 sm:text-xl md:text-2xl ${
              error.error ? "order-last" : "order-first"
            }`}
          >
            {error.error ? (
              <SlClose size={30} className="text-red-900" />
            ) : (
              imageTitle
            )}
          </div>
          <img
            alt="album art"
            src={error.error ? temp : image}
            className={`${
              image || error.error
                ? "w-full transition-all duration-700 scale-100 rounded border-zinc-900"
                : "w-0 scale-0"
            } ${image && " shadow-xl"}`}
          />
        </div>
      )}
    </main>
  );
}

export default App;
