import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import temp from "./images/soundcloud.png";
import * as Yup from "yup";
import { SlClose } from "react-icons/sl";
import { ImSpinner5 } from "react-icons/im";

function App() {
  const [image, setImage] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scError, setScError] = useState(false);
  const urlRegex = /^https?:\/\/(?:www\.)?(?:m\.)?(?:on\.)?soundcloud\.com\//;

  function base64ToUint8Array(base64) {
    const start = performance.now();
    const binaryString = atob(base64);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    console.log(performance.now() - start);
    return uint8Array;
  }

  const formik = useFormik({
    initialValues: {
      link: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      link: Yup.string()
        .matches(urlRegex, () => {
          formik.setErrors({ link: "Enter a valid url" });
          setScError(true);
          setIsPopoverOpen(true);
          return "Enter a valid url";
        })
        .required(() => {
          formik.setErrors({ link: "Link required" });
          setIsPopoverOpen(true);
          setScError(false);
          return "Link required";
        }),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      await axios
        .get(
          `${
            "https://soundcloud.com/oembed?url=" +
            values.link +
            "&amp;format=json"
          }`
        )
        .then(async (response) => {
          const titleAndArtist = response.data.title.split(" by ");
          setImageTitle(titleAndArtist[0]);
          setArtist(titleAndArtist[1]);
          if (
            response.data.thumbnail_url !==
            "https://soundcloud.com/images/fb_placeholder.png"
          ) {
            console.log("running on front");
            await axios
              .get(
                response.data.thumbnail_url.replace("t500x500", "original"),
                {
                  responseType: "blob",
                }
              )
              .then((response) => {
                console.log(titleAndArtist[0]);
                const file = new File([response.data], titleAndArtist[0], {
                  type: "image/jpeg",
                });
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result);
                };
                reader.readAsDataURL(file);
                const objectUrl = URL.createObjectURL(file);
                const link = document.createElement("a");
                link.setAttribute("href", objectUrl);
                link.setAttribute("download", titleAndArtist[0]);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                formik.setErrors({ link: "" });
                setIsLoading(false);
                setScError(false);
                setIsPopoverOpen(true);
              })
              .catch((error) => {
                setImage();
                setImageTitle();
                setIsLoading(false);
                setScError(true);
                formik.setErrors({ link: "Error while parsing" });
                // formik.setErrors({ link: error.response.statusText });
                setIsPopoverOpen(true);
                console.error(error);
              });
          } else {
            console.log("running on server");
            axios
              .post("http://192.168.1.107:5000/process_data", {
                link: values.link,
              })
              .then(async (response) => {
                console.log(response.data);
                setImageTitle(response.data.title);
                if (response.data.src) {
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
                  formik.setErrors({ link: "" });
                  setIsLoading(false);
                  setScError(false);
                  setIsPopoverOpen(true);
                }
              })
              .catch((error) => {
                setImage();
                setImageTitle();
                setIsLoading(false);
                setScError(true);
                formik.setErrors({ link: "Error while parsing" });
                // formik.setErrors({ link: error.response.statusText });
                setIsPopoverOpen(true);
                console.error(error);
              });
          }
        })
        .catch((error) => {
          setImage();
          setImageTitle();
          setIsLoading(false);
          setScError(true);
          formik.setErrors({ link: "Error while parsing" });
          // formik.setErrors({ link: error.response.statusText });
          setIsPopoverOpen(true);
          console.error(error);
        });
    },
  });
  useEffect(() => {
    if (isPopoverOpen)
      setTimeout(() => {
        setIsPopoverOpen(false);
        setTimeout(() => {
          formik.setErrors({ link: "" });
        }, 500);
      }, 5000);
  }, [isPopoverOpen, formik]);

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
            isPopoverOpen ? "opacity-100" : "opacity-0"
          } ${
            formik.errors.link
              ? "text-cred bg-rose-300"
              : "text-rose-300 bg-gray-300/20"
          }`}
        >
          {formik.errors.link
            ? formik.errors.link
            : !formik.errors.link && !scError
            ? "Downloading"
            : "‎ "}
        </div>
        <form
          onSubmit={formik.handleSubmit}
          className="relative flex w-11/12 p-1 mt-8 text-sm bg-white rounded-lg sm:w-8/12 md:w-6/12 lg:w-4/12"
        >
          <input
            value={formik.values.link}
            onChange={formik.handleChange("link")}
            onBlur={formik.handleBlur("link")}
            className="w-full px-0.5 mx-2 focus:outline-cred focus:ring-0 text-cred"
            placeholder="https://soundcloud.com/1812922/afraid-of-everything"
          />
          <button
            disabled={isLoading}
            className={`w-28 my-0.5 inset-y-0 py-2.5 bg-cred right-1 rounded-xl hover:bg-red-900 ${
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

      {(image || scError) && (
        <div className="flex flex-col w-10/12 gap-6 p-6 mx-auto mt-10 rounded-lg shadow-xl sm:p-10 sm:w-8/12 md:w-8/12 lg:w-6/12 xl:w-4/12">
          <div
            className={`mx-8 font-semibold flex justify-center ${
              formik.errors.link || scError ? "order-last" : "order-first"
            }`}
          >
            {formik.errors.link || scError ? (
              <SlClose size={30} className="text-red-900" />
            ) : (
              <div className="text-center">
                <div className="text-gray-200 sm:text-xl md:text-2xl">
                  {imageTitle}
                </div>
                <div className="mt-0.5 text-red-400">{artist}</div>
              </div>
            )}
          </div>
          <img
            alt="album art"
            src={
              scError && formik.errors.link !== "Link required" ? temp : image
            }
            className={`${
              true
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
