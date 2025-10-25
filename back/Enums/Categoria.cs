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
    [Description("Lasagna")]
    Lasagna = 9,
    [Description("Salsas")]
    Salsas = 10,
    [Description("Tartas")]
    Tartas = 11,
    [Description("Varios")]
    Varios = 12,
    [Description("Postres")]
    Postres = 13,
    [Description("Pizzas")]
    Pizzas = 14,
    [Description("Empanadas")]
    Empanadas = 15
}
