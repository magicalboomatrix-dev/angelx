import Image from "next/image";
import styles from "./page.module.css";
import Index from ".";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Index/>
      </main>    
    </div>
  );
}
