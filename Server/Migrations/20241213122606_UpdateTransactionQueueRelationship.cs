using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTransactionQueueRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_queues_orders_OrderId",
                table: "queues");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions");

            migrationBuilder.AlterColumn<int>(
                name: "OrderId",
                table: "transactions",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "QueueId",
                table: "transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OrderId",
                table: "queues",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_transactions_QueueId",
                table: "transactions",
                column: "QueueId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_queues_CashierId",
                table: "queues",
                column: "CashierId");

            migrationBuilder.AddForeignKey(
                name: "FK_queues_cashiers_CashierId",
                table: "queues",
                column: "CashierId",
                principalTable: "cashiers",
                principalColumn: "cashierId");

            migrationBuilder.AddForeignKey(
                name: "FK_queues_orders_OrderId",
                table: "queues",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "orderId");

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "orderId");

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_queues_QueueId",
                table: "transactions",
                column: "QueueId",
                principalTable: "queues",
                principalColumn: "queueId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_queues_cashiers_CashierId",
                table: "queues");

            migrationBuilder.DropForeignKey(
                name: "FK_queues_orders_OrderId",
                table: "queues");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_queues_QueueId",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_transactions_QueueId",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_queues_CashierId",
                table: "queues");

            migrationBuilder.DropColumn(
                name: "QueueId",
                table: "transactions");

            migrationBuilder.AlterColumn<int>(
                name: "OrderId",
                table: "transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "OrderId",
                table: "queues",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_queues_orders_OrderId",
                table: "queues",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "orderId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "orderId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
