import styles from "./sample.sass";

const Component = () => {
  return (
    <div className={styles.foo}>
      <div className={styles.bar}>Bar</div>
      <div className={styles.baz}>Baz</div>
      <div className={styles.active}>Active</div>
      <div className={styles.child}>Child</div>
      <div className={styles.sibling}>Sibling</div>
      <div className={styles.other}>Other</div>
      <div className={styles.complex}>Complex</div>
      <div className={styles.compound}>Compound</div>
      <div className={styles.direct}>Direct</div>
      <div className={styles.adjacent}>Adjacent</div>
      <div className={styles.general}>General</div>
    </div>
  );
};

export default Component;