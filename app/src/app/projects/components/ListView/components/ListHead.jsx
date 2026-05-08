import styles from "../ListView.module.css";

const getAriaSort = (sortConfig, key) => {
  if (sortConfig.key !== key) return "none";
  return sortConfig.direction === "asc" ? "ascending" : "descending";
};

const ListHead = ({ sortConfig, onSort }) => {
  return (
    <thead>
      <tr>
        <th scope="col" aria-sort={getAriaSort(sortConfig, "index")}>
          <button type="button" className={styles.listHeadButton} onClick={() => onSort("index")}>
            <strong>#</strong>
          </button>
        </th>
        <th scope="col" aria-sort={getAriaSort(sortConfig, "title")}>
          <button type="button" className={styles.listHeadButton} onClick={() => onSort("title")}>
            <strong>Title</strong>
          </button>
        </th>
        <th scope="col" aria-sort={getAriaSort(sortConfig, "year")}>
          <button type="button" className={styles.listHeadButton} onClick={() => onSort("year")}>
            <strong>Year</strong>
          </button>
        </th>
        <th scope="col" aria-sort={getAriaSort(sortConfig, "studio")}>
          <button type="button" className={styles.listHeadButton} onClick={() => onSort("studio")}>
            <strong>Studio</strong>
          </button>
        </th>
      </tr>
    </thead>
  );
};

export default ListHead;
