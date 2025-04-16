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
  if (!popupOptions) return null;

  const { Heading, HeadingStyle, Message } = popupOptions;

  return (
    <div className="popup-blanket">
      <div
        className="popup-component"
        style={{
            width: Array.isArray(Message) ? 'clamp(200px, 85vh, 900px)' : 'clamp(200px, 65vh, 600px)',
            height: Array.isArray(Message) ? 'clamp(150px, 60vh, 600px)' : 'clamp(150px, 35vh, 400px)',

        }}
      >
        <div className="popup-heading" style={HeadingStyle}>
          <h1>{Heading}</h1>
        </div>
        <div
          className="popup-message"
          style={{
            overflowY: 'auto',
            paddingRight: '0.7em',
          }}
        >
          {Array.isArray(Message) ? (
            <ol style={{ margin: 0, textAlign: 'left' }}>
              {Message.map((msg, idx) => (
                <li key={idx}>{msg.trim()}</li>
              ))}
            </ol>
          ) : (
            <p>{Message}</p>
          )}
        </div>
        <button onClick={closeButtonActionHandler}>X</button>
      </div>
    </div>
  );
}
