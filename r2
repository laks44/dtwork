import protectedPageRoute from "@/helper/requireAuthentication";
import { NextPageWithLayout } from "../_app";
import Layout from "@/components/Layout";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Modal,
  Snackbar,
  styled,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Back from "@/components/Layout/Back";
import PageContainer from "ui/common/containers/PageContainer";
import React, { useState } from "react";
import SearchIDNos from "@/components/SearchIDNos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, enableDisableDnd, getPatientByPatientId, getPatientByPatientIdMobile, getUserDetails } from "@/modules";
import PrescriptionCard from "@/components/PrescriptionCard";
import { useRouter } from "next/router";
import AddressForm from "@/components/AddressForm";
import Image from "next/image";
import NoData from '../../../public/images/NoData.png'
import { deleteCookie, getCookie } from "cookies-next";
import PatientDetailsTable from "@/components/PatientDetailsTable";

export interface Prescription {
  id: string;
  prescriptionId: string;
  prescriptionFile: string;
  prescriptionDate: string;
  refillDate: string;
  createDateTime: string;
  lastChangedDateTime: string;
  unit: any;
}

const StyledCell = styled(TableCell)({
  border: "0.063rem solid #E6E9EC",
  padding: "0.031rem",
  pl: "0.063rem",
  //fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "0.875rem",
  color: " rgba(0, 0, 0, 0.87)",
});

const StyledCell2 = styled(TableCell)({
  border: "0.063rem solid #E6E9EC",
  padding: "0.031rem",
  pl: "0.063rem",
  //fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "0.875rem",
  color: " rgba(0, 0, 0, 0.87)",
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "10px",
  p: 4,
  textAlign: "center",
};

const SearchDND: NextPageWithLayout = () => {
  const [mhid, setMhid] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [dnd, setDnd] = React.useState(false);
  const [loader, setLoader] = React.useState<boolean>(false);
  const [userDetails, setUserDetails] = React.useState<any>();
  const [patientData, setPatientData] = useState();
  const [pharmacistUnit, setPharmacistUnit] = React.useState<string>('')

  const router = useRouter();
  const handleMhid = (value: any) => {
    setMhid(value);
    // console.log("MHID:", value);
  };

  const handleSearch = async () => {
    try {
      const res = await getPatientByPatientIdMobile(mhid);
      // console.log("Result:", res);
      setPatientData(res); // Store the result in state
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  React.useEffect(() => {
    if (patientData?.dnd === true) {
      setDnd(true);
    }
    else {
      setDnd(false);
    }
  }, [patientData]);

  const handleButton = async () => {
    if (dnd === true) {
      const res = await enableDisableDnd({
        "patientId": mhid,
        "dndStatus": false
      })
      setDnd(false);
      // console.log(res)
    }
    else {
      const res = await enableDisableDnd({
        "patientId": mhid,
        "dndStatus": true
      })
      setDnd(true);
      // console.log(res);
    }
  }

  //get role user either pharmacist or super pharmacist
  const getUserDetail = async (id: string) => {
    try {
      setLoader(true);
      const res = await getUserDetails(id);
      setUserDetails(res.data);
      setLoader(false);
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  };
  //console.log(userDetails?.role,'ud')
  React.useEffect(() => {
    const id: any = getCookie("userid");
    if (id) {
      getUserDetail(id);
    } else {
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
      deleteCookie("userid");
      deleteCookie("sessionID");
      router.push("/login");
    }
  }, []);


  React.useEffect(() => {
    const unit = getCookie('Pharmacistunit') as string;
    setPharmacistUnit(unit)
  }, [])

  return (
    <Box>
      {/* <PageContainer panel> */}
        {patientData ?
          (
          <PatientDetailsTable
            patientData={patientData}
            mhid={mhid}
            handleMhid={setMhid}
            handleSearch={handleSearch}
            handleButton={handleButton}
            dnd={dnd}
          />):
          (
            <SearchIDNos
              mhid={mhid}
              handleMhid={handleMhid}
              handleSearch={handleSearch}
            />
          )
}
      {/* </PageContainer> */}
    </Box>
  );
};

SearchDND.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = (context: any) => {
  return protectedPageRoute(context, null, async () => {
    return {
      props: {},
    };
  });
};
export default SearchDND;
