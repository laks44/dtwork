// Refactored Campaigns Component - Production Ready
import theme from "@/theme";
import {
  Box, Button, Modal, Typography
} from "@mui/material";
import React from "react";
import CampaignsList from "./CampaignsList";
import DispositionFormCA from "./DispositionFormCA";
import { handleApiError } from "@/utils/handleApiError";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useWebSocket } from "@/hooks/useWebSocket";
import PageContainer from "ui/common/containers/PageContainer";
import { 
  getCampaignNumbers, 
  getCampaignsList, 
  hightOrderCaptureResponse, 
  unlockCallCenterOrder 
} from "@/modules";
import { getCookie, setCookie } from "cookies-next";
import AgentModal from "./CallerAgent/AgentModal";

// Interfaces
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface DepartmentData {
  id: string;
  patientId: string;
  prescriptionId: string;
  patientName?: string;
  phoneNumber?: string;
  leadStatus?: string;
  department?: string;
  unit?: string;
  agent_number?: string;
  call_status?: string;
  [key: string]: any;
}

interface CallIdentifier {
  patientId: string;
  prescriptionId: string;
  customerNumber: string;
  timestamp: number;
}

// Modal Styles
const modalStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  p: 1,
  zIndex: (theme: any) => theme.zIndex.modal + 10,
};

const modalContainerStyles = {
  bgcolor: "background.paper",
  borderRadius: 1,
  p: 3,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  border: "1px solid",
  borderColor: "divider",
  textAlign: "center" as const,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  gap: 1.5,
  minWidth: "280px",
  maxWidth: "400px",
  width: "90%",
  maxHeight: "90vh",
  overflow: "auto",
};

const iconContainerStyles = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  mb: 0.5,
};

const primaryButtonStyles = {
  borderRadius: 1,
  px: 2.5,
  py: 0.75,
  textTransform: "none" as const,
  fontWeight: 500,
  fontSize: "0.875rem",
  minWidth: "100px",
  height: "36px",
};

const secondaryButtonStyles = {
  borderRadius: 1,
  px: 2.5,
  py: 0.75,
  textTransform: "none" as const,
  fontWeight: 500,
  fontSize: "0.875rem",
  minWidth: "100px",
  height: "36px",
};

const Campaigns = (props: any) => {
  const { filters, tab } = props;

  // State Management
  const [tableData, setTableData] = React.useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [totalRecords, setTotalRecords] = React.useState<number>(0);
  const [pageNumberClicked, setPageNumberClicked] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [closeLeadModal, setCloseLeadModal] = React.useState(false);
  const [rowDataCL, setRowDataCL] = React.useState<DepartmentData | null>(null);
  const [captureResponseModal, setCaptureResponseModal] = React.useState(false);
  const [rowDataCR, setRowDataCR] = React.useState<DepartmentData | null>(null);
  const [successMsgModal, setSuccessMsgModal] = React.useState(false);
  const [itemSelected, setItemSelected] = React.useState<string[]>([]);
  const [agentNumber, setAgentNumber] = React.useState<string>('');
  const [agentModal, setAgentModal] = React.useState<boolean>(false);
  const [modalType, setModalType] = React.useState<"capture" | "close" | "dnd" | null>(null);
  const [campaignNumbers, setCampaignNumbers] = React.useState<any>([]);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  // Refs for managing async operations
  const isMountedRef = React.useRef(true);
  const activeRequestRef = React.useRef<AbortController | null>(null);
  const processedCallsRef = React.useRef<Map<string, CallIdentifier>>(new Map());
  const autoCloseTimeoutRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());
  const customerNumberRef = React.useRef<string | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const wsUnsubscribeRef = React.useRef<(() => void) | null>(null);
  
  // Scroll handlers
  const scrollHandlersRef = React.useRef<{
    saveScrollPosition: () => void;
    restoreScrollPosition: () => void;
  } | null>(null);

  // Check if any modal is open
  const isAnyModalOpen = React.useCallback(() => {
    return captureResponseModal || closeLeadModal || successMsgModal || agentModal;
  }, [captureResponseModal, closeLeadModal, successMsgModal, agentModal]);

  // Enhanced data fetching with abort controller
  const getHighOrderValueData = React.useCallback(async (preserveScroll = false) => {
    // Skip if modal is open
    if (isAnyModalOpen()) {
      console.log("Skipping data refresh - modal is open");
      return;
    }

    // Cancel previous request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    // Save scroll position if needed
    if (preserveScroll && scrollHandlersRef.current) {
      scrollHandlersRef.current.saveScrollPosition();
    }

    setIsLoading(true);

    try {
      const response = await getCampaignsList({
        leadStatus: filters.leadStatus || 'ALL',
        page: pageNumberClicked,
        limit: pageSize,
        searchString: filters.searchString || '',
        unit: filters.unit,
        department: filters.dept,
        category: 'ALL',
        source: 'ALL'
      });

      // Check if component is still mounted and request wasn't aborted
      if (!isMountedRef.current || abortController.signal.aborted) {
        return;
      }

      if (response.success) {
        setTableData(response.data?.data || []);
        setTotalRecords(response.data?.totalRecords || 0);
        
        // Restore scroll position after state update
        if (preserveScroll && scrollHandlersRef.current) {
          setTimeout(() => {
            scrollHandlersRef.current?.restoreScrollPosition();
          }, 100);
        }
      } else {
        console.error("API Error:", response.message);
        handleApiError(response.message);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      if (isMountedRef.current) {
        console.error("Unexpected Error:", error);
        handleApiError("Something went wrong while fetching data.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  }, [filters, pageNumberClicked, pageSize, isAnyModalOpen]);

  // Fetch campaign numbers
  const getCampaignNumbersData = React.useCallback(async () => {
    if (isAnyModalOpen()) {
      console.log("Skipping campaign numbers fetch - modal is open");
      return;
    }

    try {
      const response = await getCampaignNumbers();

      if (!isMountedRef.current) return;

      if (response.success) {
        setCampaignNumbers(response.data?.numbers || []);
      } else {
        console.error("API Error:", response.message);
        handleApiError(response.message);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Unexpected Error:", error);
        handleApiError("Something went wrong while fetching campaign numbers.");
      }
    }
  }, [isAnyModalOpen]);

  // Auto-close lead with deduplication
  const handleAutomaticallyCloseLead = React.useCallback(async (
    patientId: string, 
    prescriptionId: string, 
    customerNumber: string
  ) => {
    if (!patientId || !prescriptionId || !customerNumber) {
      console.warn("Missing required parameters for auto-close");
      return;
    }

    const callKey = `${patientId}_${prescriptionId}_${customerNumber}`;
    const now = Date.now();
    
    // Check if we've processed this call recently (within 30 seconds)
    const existingCall = processedCallsRef.current.get(callKey);
    if (existingCall && (now - existingCall.timestamp) < 30000) {
      console.log("Call already processed recently, skipping:", callKey);
      return;
    }

    // Mark as processed
    processedCallsRef.current.set(callKey, {
      patientId,
      prescriptionId,
      customerNumber,
      timestamp: now
    });

    // Clean up old entries (older than 60 seconds)
    for (const [key, value] of processedCallsRef.current.entries()) {
      if (now - value.timestamp > 60000) {
        processedCallsRef.current.delete(key);
      }
    }

    try {
      const res = await hightOrderCaptureResponse({
        comments: "Ringing No Answer and system automatically closed lead",
        patientId,
        prescriptionId,
        followUpStatus: "No",
        callDisposition: "Non-contact",
        serviceDispositionL1: "Ringing no Response",
        serviceDispositionL2: "",
        dnd: false,
        mobileNo: customerNumber,
      });

      if (isMountedRef.current && (res.success || res?.statusCode === 201)) {
        console.log("Lead auto-closed successfully");
        await getHighOrderValueData(true);
      }
    } catch (error) {
      console.error("Error in handleAutomaticallyCloseLead:", error);
      if (isMountedRef.current) {
        handleApiError(error);
      }
    }
  }, [getHighOrderValueData]);

  // Handle knowlarity events with proper debouncing
  const handleKnowlarityEvent = React.useCallback((eventData: any) => {
    if (!eventData || !eventData.event_type) {
      console.warn('Invalid knowlarity event received');
      return;
    }

    console.log('Knowlarity event:', eventData.event_type);

    try {
      // Handle different event types
      if (eventData?.event_type === "CUSTOMER_CALL") {
        customerNumberRef.current = eventData?.customer_number;
      }

      if (eventData?.event_type === "CUSTOMER_ANSWER" || eventData?.event_type === "BRIDGE") {
        if (customerNumberRef.current === eventData?.customer_number) {
          customerNumberRef.current = null;
        }
      }

      if (eventData?.event_type === "HANGUP") {
        const patientId = eventData?.department?.patientId;
        const prescriptionId = eventData?.department?.prescriptionId;
        const customerNumber = eventData?.customer_number;
        const callIdentifier = `${patientId}_${prescriptionId}_${customerNumber}`;

        if (customerNumberRef.current === customerNumber && patientId && prescriptionId) {
          // Clear existing timeout
          const existingTimeout = autoCloseTimeoutRef.current.get(callIdentifier);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          // Set new timeout with proper cleanup
          const timeout = setTimeout(() => {
            handleAutomaticallyCloseLead(patientId, prescriptionId, customerNumber);
            autoCloseTimeoutRef.current.delete(callIdentifier);
          }, 2000);

          autoCloseTimeoutRef.current.set(callIdentifier, timeout);
          customerNumberRef.current = null;
        }
      }

      // Skip data refresh if modal is open
      if (isAnyModalOpen()) {
        console.log("Skipping data refresh - modal is open");
        return;
      }

      // Debounced data refresh
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (!isAnyModalOpen() && isMountedRef.current) {
          getHighOrderValueData(true);
          setTimeout(() => {
            if (isMountedRef.current) {
              getCampaignNumbersData();
            }
          }, 2000);
        }
      }, 500);
    } catch (error) {
      console.error('Error handling knowlarity event:', error);
    }
  }, [isAnyModalOpen, getHighOrderValueData, getCampaignNumbersData, handleAutomaticallyCloseLead]);

  // Modal handlers
  const handleCloseLead = React.useCallback((value: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setCloseLeadModal(true);
    setRowDataCL(value);
  }, []);

  const handleConfirmCloseLead = React.useCallback(async (rowDataCL: any) => {
    try {
      const res = await hightOrderCaptureResponse({
        patientId: rowDataCL?.patientId,
        prescriptionId: rowDataCL?.prescriptionId,
        followUpStatus: "No"
      });

      if (isMountedRef.current && res?.statusCode === 201) {
        await unlockCallCenterOrder({
          patientId: rowDataCL?.patientId,
          prescriptionId: rowDataCL?.prescriptionId,
          name: tab,
        });
        await getHighOrderValueData();
        setModalType("close");
        setSuccessMsgModal(true);
      }
    } catch (error) {
      if (isMountedRef.current) {
        handleApiError(error);
      }
    } finally {
      if (isMountedRef.current) {
        setCloseLeadModal(false);
      }
    }
  }, [tab, getHighOrderValueData]);

  const handleCaptureResponse = React.useCallback((value: any) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    setCaptureResponseModal(true);
    setRowDataCR(value);
  }, []);

  const handleSubmitCaptureResponse = React.useCallback(async (
    updatedReason: any,
    valueFollowups: any,
    followUpDate: any,
    valueTime: any,
    selectedCD: any,
    selectedL1: any,
    selectedL2: any,
    additionalComment: string,
    dnd: boolean,
    mobileNo: string
  ) => {
    try {
      const res = await hightOrderCaptureResponse({
        comments: additionalComment,
        patientId: rowDataCR?.patientId,
        prescriptionId: rowDataCR?.prescriptionId,
        orderId: rowDataCR?.orderId,
        followUpStatus: valueFollowups,
        ...(followUpDate && { followUpDate }),
        callDisposition: selectedCD,
        serviceDispositionL1: selectedL1,
        serviceDispositionL2: selectedL2,
        timings: valueTime?.format("hh:mm A"),
        dnd,
        mobileNo,
      });

      if (isMountedRef.current && (res.success || res?.statusCode === 201)) {
        await getHighOrderValueData();
        setCaptureResponseModal(false);
        setModalType(dnd ? "dnd" : "capture");
        setSuccessMsgModal(true);
      }
    } catch (error) {
      if (isMountedRef.current) {
        handleApiError(error);
      }
    }
  }, [rowDataCR, getHighOrderValueData]);

  const closingCaptureResponseModal = React.useCallback(async (row: any) => {
    try {
      await unlockCallCenterOrder({
        patientId: row?.patientId,
        prescriptionId: row?.prescriptionId,
        name: tab,
      });
      await getHighOrderValueData();
    } catch (error) {
      console.error("Error closing capture response modal:", error);
      if (isMountedRef.current) {
        handleApiError("Failed to unlock order");
      }
    } finally {
      if (isMountedRef.current) {
        setCaptureResponseModal(false);
      }
    }
  }, [tab, getHighOrderValueData]);

  const closingCloseLeadModal = React.useCallback(async () => {
    try {
      await unlockCallCenterOrder({
        patientId: rowDataCL?.patientId,
        prescriptionId: rowDataCL?.prescriptionId,
        name: tab,
      });
      await getHighOrderValueData();
    } catch (error) {
      console.error("Error closing lead modal:", error);
      if (isMountedRef.current) {
        handleApiError("Failed to unlock order");
      }
    } finally {
      if (isMountedRef.current) {
        setCloseLeadModal(false);
      }
    }
  }, [rowDataCL, tab, getHighOrderValueData]);

  const handleAgentNumber = React.useCallback(() => {
    setCookie("agent_number", agentNumber);
    setAgentModal(false);
  }, [agentNumber]);

  // Load more handler with proper deduplication
  const handleLoadMore = React.useCallback(async () => {
    if (isLoadingMore || tableData.length >= totalRecords || isAnyModalOpen()) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = Math.floor(tableData.length / 10) + 1;

      const response = await getCampaignsList({
        leadStatus: filters.leadStatus || 'ALL',
        page: nextPage,
        limit: 10,
        searchString: filters.searchString || '',
        unit: filters.unit || 'ALL',
        department: filters.dept || 'ALL',
        category: 'ALL',
        source: filters.source || 'ALL'
      });

      if (!isMountedRef.current) return;

      if (response.success && response.data?.data) {
        const newRecords = response.data.data;
        
        setTableData(prev => {
          const existingIds = new Set(
            prev.map(item => `${item.patientId}_${item.prescriptionId}`)
          );
          const uniqueNewRecords = newRecords.filter(
            (record: any) => !existingIds.has(`${record.patientId}_${record.prescriptionId}`)
          );
          return [...prev, ...uniqueNewRecords];
        });

        if (response.data.totalRecords !== totalRecords) {
          setTotalRecords(response.data.totalRecords);
        }
      }
    } catch (error) {
      console.error("Error loading more data:", error);
      if (isMountedRef.current) {
        handleApiError("Failed to load more data");
      }
    } finally {
      if (isMountedRef.current) {
        setTimeout(() => setIsLoadingMore(false), 300);
      }
    }
  }, [isLoadingMore, tableData.length, totalRecords, filters, isAnyModalOpen]);

  const handleScrollHandlersReady = React.useCallback((handlers: any) => {
    scrollHandlersRef.current = handlers;
  }, []);

  // WebSocket setup with proper cleanup
  const { isConnected, on } = useWebSocket({
    onConnect: () => console.log('Connected to CallerAgent WebSocket'),
    onDisconnect: () => console.log('Disconnected from CallerAgent WebSocket'),
    onError: (error) => console.error('WebSocket error:', error),
  });

  // Setup WebSocket listeners
  React.useEffect(() => {
    const unsubscribe = on('knowlarityEvent', (message: WebSocketMessage) => {
      handleKnowlarityEvent(message.data.event || message.data);
    });

    wsUnsubscribeRef.current = unsubscribe;

    return () => {
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, [on, handleKnowlarityEvent]);

  // Reset page on filter changes
  React.useEffect(() => {
    setPageNumberClicked(1);
    setItemSelected([]);
  }, [filters.leadStatus, filters.dept, filters.searchString, filters.date, filters.unit]);

  // Fetch data on mount and filter/page changes
  React.useEffect(() => {
    getHighOrderValueData(false);
    getCampaignNumbersData();
  }, [filters, pageNumberClicked, pageSize]);

  // Check agent number on mount
  React.useEffect(() => {
    const _agentNumber = getCookie("agent_number");
    if (_agentNumber) {
      setAgentNumber(_agentNumber as string);
    } else {
      setAgentModal(true);
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Abort active requests
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }

      // Clear all timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      autoCloseTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      autoCloseTimeoutRef.current.clear();

      // Clear processed calls
      processedCallsRef.current.clear();

      // Unsubscribe from WebSocket
      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
      }
    };
  }, []);

  const tableDataWithKey = tableData.map((row: any) => ({
    ...row,
    patientPrescriptionKey: `${row.patientId}_${row.prescriptionId}`,
  }));

  return (
    <>
      <AgentModal 
        agentModal={agentModal} 
        setAgentModal={setAgentModal} 
        setAgentNumber={setAgentNumber} 
        handleAgentNumber={handleAgentNumber} 
      />

      <Box sx={{ bgcolor: theme.palette.primary.light, display: "flex", height: "100%" }}>
        <PageContainer>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start" }}>
            <CampaignsList
              selected={itemSelected}
              setItemSelected={setItemSelected}
              tableData={tableDataWithKey}
              isLoading={isLoading}
              agentNumber={agentNumber}
              campaignNumbers={campaignNumbers}
              pageNumberClicked={pageNumberClicked}
              setPageNumberClicked={setPageNumberClicked}
              recordsToShow={pageSize}
              setRecordsToShow={setPageSize}
              totalRecords={totalRecords}
              setTotalRecords={setTotalRecords}
              getConversionPendingData={''}
              handleCloseLead={handleCloseLead}
              handleCaptureResponse={handleCaptureResponse}
              tab={tab}
              onLoadMore={handleLoadMore}
              onScrollHandlersReady={handleScrollHandlersReady}
              isLoadingMore={isLoadingMore}
            />

            {/* Close Lead Modal */}
            <Modal open={closeLeadModal} onClose={closingCloseLeadModal} sx={modalStyles}>
              <Box sx={modalContainerStyles}>
                <Box sx={{
                  ...iconContainerStyles,
                  backgroundColor: "rgba(255, 152, 0, 0.1)",
                  border: "2px solid",
                  borderColor: "warning.main"
                }}>
                  <ErrorOutlineIcon sx={{ color: "warning.main", fontSize: "1.5rem" }} />
                </Box>

                <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                  Confirm Lead Closure
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.4 }}>
                  Are you sure you want to close this lead? This action cannot be undone.
                </Typography>

                <Box display="flex" justifyContent="center" gap={1.5} sx={{ width: "100%" }}>
                  <Button
                    onClick={closingCloseLeadModal}
                    variant="outlined"
                    sx={{
                      ...secondaryButtonStyles,
                      borderColor: "grey.400",
                      color: "text.secondary",
                      '&:hover': { borderColor: "grey.600", backgroundColor: "grey.50" }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleConfirmCloseLead(rowDataCL)}
                    variant="contained"
                    sx={{
                      ...primaryButtonStyles,
                      backgroundColor: "warning.main",
                      '&:hover': { backgroundColor: "warning.dark" }
                    }}
                  >
                    Close Lead
                  </Button>
                </Box>
              </Box>
            </Modal>

            {/* Success/DND Modal */}
            <Modal open={successMsgModal} onClose={() => setSuccessMsgModal(false)} sx={modalStyles}>
              <Box sx={modalContainerStyles}>
                <Box sx={{
                  ...iconContainerStyles,
                  backgroundColor: modalType === "dnd" ? "rgba(244, 67, 54, 0.1)" : "rgba(76, 175, 80, 0.1)",
                  border: "2px solid",
                  borderColor: modalType === "dnd" ? "error.main" : "success.main",
                }}>
                  {modalType === "dnd" ? (
                    <WarningAmberIcon sx={{ color: "error.main", fontSize: "1.5rem" }} />
                  ) : (
                    <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: "1.5rem" }} />
                  )}
                </Box>

                {modalType === "close" && (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} color="success.main" sx={{ mb: 1 }}>
                      Lead Closed Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      The lead has been closed and saved in the system.
                    </Typography>
                  </>
                )}

                {modalType === "capture" && (
                  <>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      Response Captured Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      The patient's response has been recorded.
                    </Typography>
                  </>
                )}

                {modalType === "dnd" && (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} color="error.main" sx={{ mb: 1 }}>
                      DND Enabled!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      DND has been enabled for patient {rowDataCR?.patientId}.
                    </Typography>
                  </>
                )}

                <Button
                  onClick={() => setSuccessMsgModal(false)}
                  variant="contained"
                  sx={{
                    ...primaryButtonStyles,
                    mt: 1.5,
                    backgroundColor: modalType === "dnd" ? "error.main" : "success.main",
                    '&:hover': { backgroundColor: modalType === "dnd" ? "error.dark" : "success.dark" }
                  }}
                >
                  OK
                </Button>
              </Box>
            </Modal>

            {/* Capture Response Modal */}
            <DispositionFormCA
              open={captureResponseModal}
              onClose={() => closingCaptureResponseModal(rowDataCR)}
              handleSubmitCapture={handleSubmitCaptureResponse}
              rowData={rowDataCR}
            />
          </Box>
        </PageContainer>
      </Box>
    </>
  );
};

export default Campaigns;
