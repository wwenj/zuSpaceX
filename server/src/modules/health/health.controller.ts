import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("health")
@Controller("api/health")
@Public()
export class HealthController {
  @Get("liveness")
  @ApiOperation({ summary: "存活检查" })
  @ApiResponse({ status: 200, description: "服务存活" })
  async liveness() {
    return { message: "liveness" };
  }

  @Get("readiness")
  @ApiOperation({ summary: "就绪检查" })
  @ApiResponse({ status: 200, description: "服务就绪" })
  async readiness() {
    return { message: "readiness" };
  }
}
