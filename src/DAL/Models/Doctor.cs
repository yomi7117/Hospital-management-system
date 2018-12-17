using System;
using System.Collections.Generic;
using System.Text;

namespace DAL.Models
{
    public class Doctor: AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
    }
}
