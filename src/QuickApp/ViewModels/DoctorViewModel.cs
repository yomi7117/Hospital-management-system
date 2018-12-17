using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuickApp.ViewModels
{
    public class DoctorViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class DoctorViewModelValidator : AbstractValidator<DoctorViewModel>
    {
        public DoctorViewModelValidator()
        {
            RuleFor(register => register.Name).NotEmpty().WithMessage("Doctor name cannot be empty");
            RuleFor(register => register.PhoneNumber).NotEmpty().WithMessage("PhoneNumber cannot be empty");
        }
    }
}

