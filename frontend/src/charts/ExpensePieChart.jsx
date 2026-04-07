import { PieChart, Pie, Tooltip } from "recharts";

function ExpensePieChart({ data }) {

  return (

    <PieChart width={400} height={300}>

      <Pie
        data={data}
        dataKey="amount"
        nameKey="category"
      />

      <Tooltip />

    </PieChart>

  );
}

export default ExpensePieChart;