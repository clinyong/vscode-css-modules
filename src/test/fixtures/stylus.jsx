import styles1 from "./stylus.styl";
const styles2 = require("./stylus.stylus");

const Component = () => (
  <div className={styles1.app}>
    <span className={styles1.main}>1</span>
    <span className={styles1.bar}>1</span>
    <span className={styles2.tip}>2</span>
    <span className={styles2.danger}>2</span>
    <span className={styles2.warning}>2</span>
  </div>
);

export default Component;
