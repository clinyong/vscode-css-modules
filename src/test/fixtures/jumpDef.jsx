import styles1 from "./jumpDef.css";
const styles2 = require("./jumpDef.css");

const Component = () => (
  <div className={styles1.classname}>
    {data}<i className={styles2.classname}>@</i>
    <span className={styles1.left}>1</span>
    <span className={styles2.left}>2</span>
  </div>
);

export default Component;
