import { Modal, Button, Typography } from "antd";

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
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={430}
      closable={false}
      bodyStyle={{ padding: 32, textAlign: "center", overflowX: "hidden" }}
    >
      {icon && (
        <img
          src={icon}
          alt="confirm"
          style={{ width: 60, height: 60, marginBottom: 20 }}
        />
      )}
      <Typography.Title level={4} style={{ fontWeight: 700, color: "#252B3D" }}>
        {title}
      </Typography.Title>

      {content && (
        <Typography.Text style={{ fontSize: 16, color: "#5F6B81" }}>
          {content}
        </Typography.Text>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 32 }}>
        <Button
          onClick={handleClose}
          style={{
            minWidth: 120,
            borderRadius: 8,
            borderColor: "#CBD5E1",
            color: "#1E293B",
            fontWeight: 600,
          }}
        >
          Huỷ
        </Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          style={{
            minWidth: 120,
            borderRadius: 8,
            backgroundColor: "#6366F1",
            fontWeight: 600,
          }}
          danger={false}
        >
          Xác nhận
        </Button>
      </div>
    </Modal>
  );
};

export default DialogConfirm;
