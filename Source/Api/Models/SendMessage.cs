namespace Ergec.CentrifugoChat.Models
{
    public class SendMessage
    {
        public string Sender { get; set; }
        public string SenderUserName { get; set; }
        public string? Receiver { get; set; }
        public string? ReceiverUserName { get; set; }
        public string Message { get; set; }
        public DateTime? Date { get; set; }
    }
}
