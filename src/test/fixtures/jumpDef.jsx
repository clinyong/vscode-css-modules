import styles1 from "./jumpDef.css";
const styles2 = require("./jumpDef.css");

const Component = () => (
  <div className={styles1.classname}>
    {data}<i className={styles2.classname}>@</i>
  </div>
);

export default Component;
