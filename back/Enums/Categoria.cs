using System.ComponentModel;

namespace back.Enums;

public enum Categoria
{
    [Description("Ravioles")]
    Ravioles = 1,
    [Description("Canelones")]
    Canelones = 2,
    [Description("Agnolottis")]
    Agnolottis = 3,
    [Description("Tallarines")]
    Tallarines = 4,
    [Description("Ñoquis")]
    Ñoquis = 5,
    [Description("Sorrentinos")]
    Sorrentinos = 6,
    [Description("Capelettis")]
    Capelettis = 7,
    [Description("Tortellettis")]
    Tortellettis = 8,
    [Description("Salsas")]
    Salsas = 9,
    [Description("Tartas")]
    Tartas = 10,
    [Description("Varios")]
    Varios = 11,
    [Description("Postres")]
    Postres = 12,
    [Description("Pizzas")]
    Pizzas = 13,
    [Description("Empanadas")]
    Empanadas = 14
}
