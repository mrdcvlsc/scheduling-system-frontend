import "../assets/Loading.css";

export function Loading({
  IsLoading,
}) {
  return IsLoading ? (
    <div className="loading-component">
      <h1>Please wait...</h1>
      <div className="loading-spinner" />
    </div>
  ) : null;
}

/**example popup option state structure:
 * 
 * ```json
 * popupOptions = {
 *  "Heading": "Success",
 *  "HeadingStyle" : {color: "white", background : "green"}
 *  "Message": "action is done"
 * }
 * ```
 */
export function Popup({
  popupOptions,
  closeButtonActionHandler
}) {
  return popupOptions ? (
    <div className="popup-blanket">
      <div className="popup-component">
        <div className="popup-heading" style={popupOptions.HeadingStyle}>
          <h1>{popupOptions.Heading}</h1>
        </div>
        <div className="popup-message">
          <p>{popupOptions.Message}</p>
        </div>
        <button onClick={closeButtonActionHandler}>X</button>
      </div>
    </div>
  ) : null;
}