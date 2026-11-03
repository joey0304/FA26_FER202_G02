import RequestList from '../components/RequestList';

export default function ConsultationManagementPage(){
    return (
        <RequestList
            resource="consultations"
            title="Quản lý yêu cầu tư vấn"
            manage
        />
    );
}
