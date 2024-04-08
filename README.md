[![npm](https://img.shields.io/npm/v/react-datetime-picker-component.svg)](https://www.npmjs.com/package/react-datetime-picker-component)

# Alert Notify

## Quick Start

#### You can use this package in any project that either use React or does not use any framework.

- Install by running `npm install alert-notify` or `yarn add alert-notify`.
- For React projects: Import `import  AlertNotifyContainer  from  "alert-notify/react/container";`.
- For Non React projects: Just add `<div  id="alertNotify_main_container"></div>` inside body tag.
- Add `<AlertNotifyContainer  />` inside your `<App />` and import Style file
  - `import  "alert-notify/Style.scss";` if you are using sass,
  - `import  "alert-notify/style.min.css";` if you are using css only.
    (In non-React projects, you can import style file wherever you need them. Just ensure that they are added to the project correctly.)
- Import `import  showAlert, { SUCCESS, DEFAULT, ERROR, INFO, WARNING } from  "./alert";`.
- Use this function to show alerts `showAlert(ALERT_TYPE, MESSAGE_HERE);` Valid ALERT_TYPES are `SUCCESS`, `DEFAULT`, `ERROR`, `INFO`, `WARNING`.

## Getting started

### Usage

```js
import showAlert, {
  SUCCESS,
  DEFAULT,
  ERROR,
  INFO,
  WARNING,
} from "alert-notify";
import AlertNotifyContainer from "alert-notify/container";

import "alert-notify/Style.scss";

function App() {
  return (
    <div className="App">
      <AlertNotifyContainer />
      <button
        onClick={() => {
          showAlert(SUCCESS, "This is Success Message.");
          showAlert(DEFAULT, "This is DEFAULT Message.");
          showAlert(ERROR, "This is ERROR Message.");
          showAlert(INFO, "This is INFO Message.");
          showAlert(WARNING, "This is WARNING Message.");
        }}
      >
        {" "}
        Show Alert
      </button>
    </div>
  );
}

export default App;
```

### Example

#### Alerts

![Alerts](https://github.com/Bhardwaj-Raghav/alert-notify/blob/main/example/example.PNG?raw=true)

## License

The MIT License.
