import "./App.css";
import axios from "axios";
// import downloadArrow from "./downloadArrow.png";
// import downloading from "./downloading.png";
// import download from "./download(1).png";
// import d from "./download-2-32.png";
import d1 from "./download-2-24.png";
import { useFormik } from "formik";
// import d2 from "./download-2-512.png";
import * as yup from "yup";

function App() {
  const formik = useFormik({
    initialValues: { link: "" },
    validationSchema: { link: yup.string().url() },
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <main>
      <div className="grid pt-4 justify-items-center background">
        <header>
          <h1 className="mt-8 text-5xl">Art Aesthetics</h1>
          <p className="mt-8 text-lg">
            Download Soundcloud Artworks in original high quality
          </p>
        </header>
        <div className="pt-24 text-sm">
          <input className="c-checkbox" type="checkbox" id="checkbox" />
          <div className="c-formContainer">
            <form className="c-form" onSubmit={formik.handleSubmit}>
              <input
                className="c-form__input"
                placeholder="   Soundcloud link"
                value={formik.values.link}
                onChange={formik.handleChange("link")}
                onBlur={formik.handleBlur("link")}
                // type="url"
                // required
              />
              <label className="c-form__buttonLabel" for="checkbox">
                <button
                  className="px-8 c-form__button"
                  style={{ fontSize: 17 }}
                  type="submit"
                >
                  <img
                    src={d1}
                    alt="download"
                    className="pl-8 text-white"
                    onClick={scrapeImage}
                  />
                </button>
              </label>
              <label
                className="c-form__toggle"
                for="checkbox"
                data-title="Get to it"
              ></label>
            </form>
          </div>
        </div>
        <div className="h-36"></div>
      </div>
    </main>
  );
}

export default App;
async function scrapeImage() {
  // Send a request to the webpage and retrieve the HTML source code
  const response = await axios.get(
    "https://soundcloud.com/user-392322640/liquid-metal"
  );
  const html = await response.text();
  console.log(response);
  // Parse the HTML source code and create a DOM tree
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Find the image element
  const imageElement = doc.querySelector("img");

  // Get the URL of the image
  const imageUrl = imageElement.src;

  // Create a new image object and set its src property to the image URL
  const image = new Image();
  image.src = imageUrl;
}
