import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
  } from '@mui/material';
  
  interface DialogConfirmProps {
    open: boolean;
    handleClose: () => void;
    handleConfirm: () => void;
    title: string;
    content?: string;
    icon?: string;
  }
  
  const DialogConfirm = ({
    title,
    content,
    open,
    handleClose,
    handleConfirm,
    icon,
  }: DialogConfirmProps) => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            width: '100%',
            maxWidth: '430px',
            padding: '32px',
            overflowX: 'hidden',
          },
        }}
      >
        {icon && (
          <img
            src={icon}
            alt='confirm'
            style={{
              width: '60px',
              height: '60px',
              margin: '0 auto',
            }}
          />
        )}
        <DialogTitle
          id='alert-dialog-title'
          sx={{
            textAlign: 'center',
            fontSize: '24px',
            color: '#252B3D',
            fontWeight: 700,
          }}
        >
          {title}
        </DialogTitle>
  
        {content && (
          <DialogContent>
            <DialogContentText
              id='alert-dialog-description'
              sx={{
                textAlign: 'center',
                fontSize: '18px',
                color: '#5F6B81',
              }}
            >
              {content}
            </DialogContentText>
          </DialogContent>
        )}
  
        <DialogActions
          sx={{
            justifyContent: 'center',
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            onClick={handleClose}
            variant='outlined'
            sx={{
              minWidth: '120px',
              borderRadius: '8px',
              borderColor: '#CBD5E1',
              color: '#1E293B',
              fontWeight: 600,
            }}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleConfirm}
            variant='contained'
            sx={{
              minWidth: '120px',
              borderRadius: '8px',
              backgroundColor: '#6366F1',
              fontWeight: 600,
              color: '#fff',
              '&:hover': {
                backgroundColor: '#4F46E5',
              },
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default DialogConfirm;
  