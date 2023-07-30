import "./App.css";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import temp from "./images/temp.png";
import * as Yup from "yup";

function App() {
  const [image, setImage] = useState();
  const [imageTitle, setImageTitle] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState({ error: false, text: "Downloading" });
  const urlRegex = /^https?:\/\/(?:www\.)?soundcloud\.com\//;
  const formik = useFormik({
    initialValues: {
      link: "https://soundcloud.com/night_lovell/mary-jane-1",
    },
    validationSchema: Yup.object({
      link: Yup.string().matches(urlRegex, "Enter a valid url"),
    }),
    onSubmit: (values) => {
      axios
        .post("http://localhost:5000/process_data", { link: values.link })
        .then(async (response) => {
          console.log(response.data);
          setImageTitle(response.data.title);
          if (response.data.src) {
            console.log(response.data.src);
            await axios
              .get(response.data.src, { responseType: "blob" })
              .then(async (response_blob) => {
                const file = new File(
                  [response_blob.data],
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

                const objectUrl = URL.createObjectURL(response_blob.data);
                const link = document.createElement("a");
                link.setAttribute("href", objectUrl);
                link.setAttribute("download", response.data.title);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setIsOpen(true);
              })
              .catch((error) => {
                setError({ error: true, text: error.response.data.error });
                console.error(error);
              });
          }
        })
        .catch((error) => {
          setError({ error: true, text: error.response.data.error });
          console.error(error);
        });
    },
  });
  // useEffect(() => {
  //   if (isOpen)
  //     setTimeout(() => {
  //       setIsOpen(false);
  //     }, 5000);
  // });
  return (
    <main className="selection:text-red-400 selection:bg-gray-900">
      <div className="flex flex-col items-center pt-4 background">
        <header className="text-center ">
          <h1 className="my-8 text-5xl">Art Aesthetics</h1>
          <p className="my-8 text-lg">
            Download Soundcloud Artworks in original high quality
          </p>
        </header>
        <div></div>

        <div
          className={`mt-16 top-0 px-8 py-2 text-sm transition-all duration-500 border rounded-md  border-rose-400 opacity-0 ${
            isOpen ? "opacity-100" : "opacity-0"
          } ${
            error.error
              ? "text-cred bg-rose-300"
              : "text-rose-300 bg-gray-300/20"
          }`}
        >
          {error.text}
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="relative flex w-2/5 p-1 mt-8 text-sm bg-white rounded-lg"
        >
          <input
            value={formik.values.link}
            onChange={formik.handleChange("link")}
            onBlur={formik.handleBlur("link")}
            className="w-full px-1 mx-2 focus:outline-cred focus:ring-0 text-cred"
            placeholder="https://soundcloud.com/1812922/afraid-of-everything"
          />
          <button
            className=" inset-y-0 px-2 py-2.5 my-0.5 bg-cred right-1 rounded-xl hover:bg-red-900"
            type="submit"
          >
            Download
          </button>
        </form>
      </div>
      <div className="mt-12 text-2xl text-center text-gray-300 ">
        {imageTitle}
      </div>
      <img
        alt="preview"
        src={image ? image : temp}
        className={` ${
          image
            ? "w-1/3 mx-auto mb-8 mt-2 transition-all duration-700 scale-100 rounded lg:w-1/3 md:w-1/2 border-zinc-900"
            : "w-0 scale-0"
        }`}
      />
    </main>
  );
}

export default App;
