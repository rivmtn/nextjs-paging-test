import axios from "axios";
import { useEffect, useState } from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Typography } from "@mui/material";

export default function PagingTest() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [blockNumber, setBlockNumber] = useState(1);
  const [blockSize, setBlockSize] = useState(8);
  const [startPageNumber, setStartPageNumber] = useState(1); // 현재 블록의 시작 페이지 번호
  const [endPageNumber, setEndPageNumber] = useState(8); // 현재 블록의 마지막 페이지 번호
  const firstPageNumber = 1; // 전체 페이지의 첫번째 페이지
  const [lastPageNumber, setLastPageNumber] = useState(1); // 전체 페이지의 마지막 페이지
  const [totalCount, setTotalCount] = useState(0); // 전체 데이터 개수
  const [axiosCount, setAxiosCount] = useState(0); // axios 요청 횟수
  const [isInit, setIsInit] = useState(true); // 초기화 여부

  const [groupedArray, setGroupedArray] = useState({
    1: [] as CustomerDao[],
    2: [] as CustomerDao[],
    3: [] as CustomerDao[],
    4: [] as CustomerDao[],
    5: [] as CustomerDao[],
    6: [] as CustomerDao[],
    7: [] as CustomerDao[],
    8: [] as CustomerDao[],
  });

  const list = (
    startPageNumber: number,
    endPageNumber: number,
    pageNumber: number
  ) => {
    const list = [];
    for (let i = startPageNumber; i <= endPageNumber; i++) {
      list.push(
        <button
          key={i}
          style={i === pageNumber ? { fontWeight: "bold" } : {}}
          onClick={() => {
            setPageNumber(i);
          }}
        >
          {" "}
          {i}{" "}
        </button>
      );
    }
    return list;
  };

  useEffect(() => {
    if (isInit) {
      setIsInit(false);
    }
    const newBlockNumber = Math.floor((pageNumber - 1) / blockSize) + 1;
    if (!isInit && newBlockNumber === blockNumber) {
      return;
    }
    setBlockNumber(newBlockNumber);

    setAxiosCount(axiosCount + 1);

    fatchData(newBlockNumber).then((data) => {
      const pages = Math.ceil(data.array.length / pageSize);
      console.log("data.array.length : " + data.array.length);
      console.log("pageSize : " + pageSize);
      console.log("pages : " + pages);
      const newStartPageNumber =
        Math.floor((pageNumber - 1) / blockSize) * blockSize + 1;
      const newEndPageNumber = newStartPageNumber + pages - 1;
      setStartPageNumber(newStartPageNumber);
      setEndPageNumber(newEndPageNumber);
      setTotalCount(data.json.totalCount);
      setLastPageNumber(Math.ceil(data.json.totalCount / pageSize));

      const newGroupedArray = {
        1: [] as CustomerDao[],
        2: [] as CustomerDao[],
        3: [] as CustomerDao[],
        4: [] as CustomerDao[],
        5: [] as CustomerDao[],
        6: [] as CustomerDao[],
        7: [] as CustomerDao[],
        8: [] as CustomerDao[],
      };

      for (let i = 1; i <= pages; i++) {
        newGroupedArray[i] = data.array.slice((i - 1) * pageSize, i * pageSize);
      }

      for (let i = pages + 1; i <= blockSize; i++) {
        newGroupedArray[i] = [];
      }

      setGroupedArray(newGroupedArray);
    });
  }, [axiosCount, blockNumber, blockSize, isInit, pageNumber, pageSize]);

  return (
    <>
      <div>AXIOS 요청 횟수 : {axiosCount.toString()}</div>
      <div>
        <Typography>총 {totalCount}건</Typography>
      </div>
      <div>
        <label>페이지 사이즈</label>
        <select
          onChange={(e) => {
            const newPageSize = Number(e.target.value);
            setPageSize(newPageSize);
            switch (newPageSize) {
              case 15:
                setBlockSize(8);
                break;
              case 30:
                setBlockSize(4);
                break;
              case 60:
                setBlockSize(2);
                break;
            }
            setPageNumber(firstPageNumber);
          }}
        >
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="60">60</option>
        </select>
      </div>
      <div>
        <DataGrid
          columns={getColumns()}
          rows={
            groupedArray[
              pageNumber % blockSize === 0 ? blockSize : pageNumber % blockSize
            ]
          }
        />
      </div>
      <div>
        <button
          onClick={() => {
            if (pageNumber === firstPageNumber) {
              return;
            }
            setPageNumber(firstPageNumber);
          }}
        >
          {"|<"}
        </button>{" "}
        <button
          onClick={() => {
            if (blockNumber === 1) {
              return;
            }
            setPageNumber(startPageNumber - 1);
          }}
        >
          {"<"}
        </button>{" "}
        {list(startPageNumber, endPageNumber, pageNumber)}{" "}
        <button
          onClick={() => {
            if (blockNumber === Math.ceil(totalCount / blockSize)) {
              return;
            }
            setPageNumber(endPageNumber + 1);
          }}
        >
          {">"}
        </button>{" "}
        <button
          onClick={() => {
            if (pageNumber === lastPageNumber) {
              return;
            }
            setPageNumber(lastPageNumber);
          }}
        >
          {">|"}
        </button>{" "}
      </div>
    </>
  );
}

export interface CustomerDao {
  id?: string;
  userId?: string;
}
interface CellType {
  row: CustomerDao;
}

const fatchData = async (blockNumber: number) => {
  // const response = await axios.get(
  //   `http://127.0.0.1:8000/test?blockNumber=${blockNumber.toString()}`
  // );
  const loginResponse = await axios.post(
    `http://13.124.4.44/systems/employee?do=login`,
    {
      krName: "루니",
      password: "1234",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const accessToken = loginResponse.data.json.accessToken;
  const response = await axios.post(
    `http://13.124.4.44/admin/customers/customer?do=list&page=${blockNumber.toString()}&limit=0`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

const getColumns = (): GridColDef[] => {
  return [
    {
      flex: 0.1,
      minWidth: 120,
      sortable: false,
      //  hide: true,
      field: "id",
      headerName: "No.",

      renderCell(params: CellType) {
        const { row } = params;
        const id = row.id;
        return <Typography>{id}</Typography>;
      },
    },
    {
      flex: 0.1,
      minWidth: 120,
      sortable: false,
      field: "userId",
      headerName: "아이디",

      renderCell(params: CellType) {
        const { row } = params;
        const userId = row.userId;
        return <Typography>{userId}</Typography>;
      },
    },
  ];
};
